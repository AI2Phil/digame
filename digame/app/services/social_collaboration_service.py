from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any, Set # Added Set for efficient skill comparison

from ..models.user import User, UserProfile
# Assuming user_crud contains get_user_profile and get_users
from ..crud import user_crud # This will provide access to user and user_profile CRUD

class SocialCollaborationService:
    def __init__(self, db: Session):
        self.db = db

    def _get_user_skills(self, user_id: int) -> Optional[Set[str]]:
        """Helper to fetch and parse user skills into a set."""
        profile = user_crud.get_user_profile(self.db, user_id=user_id)
        if not profile or not profile.skills:
            return None

        # Assuming skills are stored as a list of strings: ["Python", "FastAPI"]
        # If skills are [{"skill": "Python", "level": "Advanced"}, ...], then:
        # return {s.get("skill").lower() for s in profile.skills if s.get("skill")}
        if isinstance(profile.skills, list):
            return {skill.lower() for skill in profile.skills if isinstance(skill, str)}
        return None

    def _get_user_learning_goals(self, user_id: int) -> Optional[Set[str]]:
        """Helper to fetch and parse user learning goals into a set."""
        profile = user_crud.get_user_profile(self.db, user_id=user_id)
        if not profile or not profile.learning_goals:
            return None

        # Assuming learning_goals are stored as a list of strings
        if isinstance(profile.learning_goals, list):
            return {goal.lower() for goal in profile.learning_goals if isinstance(goal, str)}
        # If learning_goals is a single Text field, it might need different parsing
        # For now, consistent with list of strings assumption.
        return None

    def get_skill_based_matches(self, user_id: int, limit: int = 10) -> List[User]:
        """
        Finds users with similar skills.
        """
        target_user_skills = self._get_user_skills(user_id)
        if not target_user_skills:
            return []

        # Fetch candidate users.
        # For now, fetch all other users. In a real system, apply filtering (e.g., same tenant, active).
        # Also, user_crud.get_users() might not load profiles by default.
        all_users = user_crud.get_users(self.db, limit=1000) # Arbitrary limit for now

        candidate_matches = []

        for candidate_user in all_users:
            if candidate_user.id == user_id:
                continue

            candidate_user_skills = self._get_user_skills(candidate_user.id)
            if not candidate_user_skills:
                continue

            common_skills = target_user_skills.intersection(candidate_user_skills)
            match_score = len(common_skills)

            if match_score > 0:
                # Store user object and score. Consider returning a richer structure if needed.
                candidate_matches.append({"user": candidate_user, "score": match_score})

        # Sort candidates by match score
        candidate_matches.sort(key=lambda x: x["score"], reverse=True)

        # Return top N users
        return [match["user"] for match in candidate_matches[:limit]]

    def get_learning_partner_recommendations(self, user_id: int, limit: int = 10) -> List[User]:
        """
        Recommends learning partners based on learning goals, skills, and mentorship preferences.
        """
        target_user_profile = user_crud.get_user_profile(self.db, user_id=user_id)
        if not target_user_profile:
            return []

        target_learning_goals = self._get_user_learning_goals(user_id)
        # target_skills = self._get_user_skills(user_id) # Could be used for peer matching

        if not target_learning_goals: # If user has no learning goals, difficult to recommend
            return []

        all_users = user_crud.get_users(self.db, limit=1000)
        recommendations = []

        for candidate_user in all_users:
            if candidate_user.id == user_id:
                continue

            candidate_profile = user_crud.get_user_profile(self.db, candidate_user.id)
            if not candidate_profile:
                continue

            score = 0

            # Criteria 1: Candidate has skills matching target user's learning goals
            candidate_skills = self._get_user_skills(candidate_user.id)
            if candidate_skills:
                matching_goal_skills = target_learning_goals.intersection(candidate_skills)
                score += len(matching_goal_skills) * 2 # Higher weight for providing skills

            # Criteria 2: Candidate is willing to mentor on topics related to target's learning goals
            if candidate_profile.mentorship_preferences and isinstance(candidate_profile.mentorship_preferences, dict):
                if candidate_profile.mentorship_preferences.get("willing_to_mentor"):
                    mentor_topics_raw = candidate_profile.mentorship_preferences.get("topics", [])
                    if isinstance(mentor_topics_raw, list):
                        mentor_topics = {topic.lower() for topic in mentor_topics_raw if isinstance(topic, str)}
                        if target_learning_goals.intersection(mentor_topics):
                            score += 3 # Higher weight for mentorship alignment

            # Criteria 3: Candidate has similar learning goals (peer learning)
            candidate_learning_goals = self._get_user_learning_goals(candidate_user.id)
            if candidate_learning_goals:
                common_goals = target_learning_goals.intersection(candidate_learning_goals)
                score += len(common_goals)

            if score > 0:
                recommendations.append({"user": candidate_user, "score": score})

        recommendations.sort(key=lambda x: x["score"], reverse=True)
        return [rec["user"] for rec in recommendations[:limit]]

```
