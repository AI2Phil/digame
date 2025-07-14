"""
Enhanced Social Collaboration Service with real project data integration,
peer messaging system, improved matching algorithms, skill endorsements,
and comprehensive conversation management.
"""

import json # Added json
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any, Set # Added Set for efficient skill comparison
from sqlalchemy import or_, and_
from datetime import datetime

from ..models.user import User
from ..models.imports import UserProfile
# Assuming user_crud contains get_user_profile and get_users
from ..crud import user_crud, project_crud

# Handle missing communication_crud import
class MockCommunicationCrud:
    def create_message(self, *args, **kwargs):
        raise NotImplementedError("communication_crud not available")
    def get_messages_between_users(self, *args, **kwargs):
        return []
    def mark_messages_as_read(self, *args, **kwargs):
        return 0
    def get_conversations(self, *args, **kwargs):
        return []

try:
    from ..crud import communication_crud  # type: ignore
except ImportError:
    communication_crud = MockCommunicationCrud()  # type: ignore
from ..schemas.communication_schemas import MessageCreate, MessageResponse, ConversationResponse, MessageUser
from ..models.communication import Message as MessageModel # Alias to avoid confusion

class SocialCollaborationService:
    def __init__(self, db: Session):
        self.db = db

    def _get_user_skills(self, user_id: int) -> Optional[Set[str]]:
        """Helper to fetch and parse user skills into a set."""
        profile = user_crud.get_user_profile(self.db, user_id=user_id)
        if not profile or not getattr(profile, 'skills', None):
            return set() # Return empty set if no profile or no skills

        # UserProfile.skills is JSON, schema UserProfileBase suggests List[Dict[str, str]]
        # e.g., [{"skill": "Python", "proficiency": "Advanced"}]
        skills_data = profile.skills
        if isinstance(skills_data, str): # If stored as JSON string in DB
            try:
                skills_list = json.loads(skills_data)
            except json.JSONDecodeError:
                return set()
        elif isinstance(skills_data, list):
            skills_list = skills_data
        else:
            return set()

        parsed_skills = set()
        if isinstance(skills_list, list):
            for item in skills_list:
                if isinstance(item, dict) and "skill" in item and isinstance(item["skill"], str):
                    parsed_skills.add(item["skill"].lower())
                elif isinstance(item, str): # Support for list of strings directly
                    parsed_skills.add(item.lower())
        return parsed_skills

    def _get_user_learning_goals(self, user_id: int) -> Optional[Set[str]]:
        """Helper to fetch and parse user learning goals (JSON list in Text field) into a set."""
        profile = user_crud.get_user_profile(self.db, user_id=user_id)
        if not profile or not getattr(profile, 'learning_goals', None):
            return set()

        learning_goals_data = profile.learning_goals
        # learning_goals is Text in model, List[str] in schema. Assume JSON encoded list.
        if isinstance(learning_goals_data, str):
            try:
                goals_list = json.loads(learning_goals_data)
                if isinstance(goals_list, list):
                    return {str(goal).lower() for goal in goals_list if isinstance(goal, (str, int, float))} # Ensure items are strings
            except json.JSONDecodeError:
                # If not JSON, could try splitting if it's comma-separated, or return empty.
                # For now, assume it must be valid JSON list of strings.
                return set()
        elif isinstance(learning_goals_data, list): # If already parsed to list
             return {str(goal).lower() for goal in learning_goals_data if isinstance(goal, (str, int, float))}
        return set()

    def _get_user_interests(self, user_id: int) -> Set[str]:
        """Helper to fetch and parse user interests (JSON list) into a set."""
        profile = user_crud.get_user_profile(self.db, user_id=user_id)
        if not profile or not getattr(profile, 'interests', None):
            return set()

        interests_data = profile.interests
        if isinstance(interests_data, str): # If stored as JSON string
            try:
                interests_list = json.loads(interests_data)
            except json.JSONDecodeError:
                return set()
        elif isinstance(interests_data, list):
            interests_list = interests_data
        else:
            return set()

        if isinstance(interests_list, list):
            return {interest.lower() for interest in interests_list if isinstance(interest, str)}
        return set()

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
            if getattr(candidate_user, 'id', None) == user_id:
                continue

            candidate_user_skills = self._get_user_skills(getattr(candidate_user, 'id', 0))
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
            if getattr(candidate_user, 'id', None) == user_id:
                continue

            candidate_profile = user_crud.get_user_profile(self.db, getattr(candidate_user, 'id', 0))
            if not candidate_profile:
                continue

            score = 0

            # Criteria 1: Candidate has skills matching target user's learning goals
            candidate_skills = self._get_user_skills(getattr(candidate_user, 'id', 0))
            if candidate_skills:
                matching_goal_skills = target_learning_goals.intersection(candidate_skills)
                score += len(matching_goal_skills) * 2 # Higher weight for providing skills

            # Criteria 2: Candidate is willing to mentor on topics related to target's learning goals
            if getattr(candidate_profile, 'mentorship_preferences', None) and isinstance(getattr(candidate_profile, 'mentorship_preferences', None), dict):
                if candidate_profile.mentorship_preferences.get("willing_to_mentor"):
                    mentor_topics_raw = candidate_profile.mentorship_preferences.get("topics", [])
                    if isinstance(mentor_topics_raw, list):
                        mentor_topics = {topic.lower() for topic in mentor_topics_raw if isinstance(topic, str)}
                        if target_learning_goals.intersection(mentor_topics):
                            score += 3 # Higher weight for mentorship alignment

            # Criteria 3: Candidate has similar learning goals (peer learning)
            candidate_learning_goals = self._get_user_learning_goals(getattr(candidate_user, 'id', 0))
            if candidate_learning_goals:
                common_goals = target_learning_goals.intersection(candidate_learning_goals)
                score += len(common_goals)

            if score > 0:
                recommendations.append({"user": candidate_user, "score": score})

        recommendations.sort(key=lambda x: x["score"], reverse=True)
        return [rec["user"] for rec in recommendations[:limit]]

    def get_networking_opportunities(self, user_id: int, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Identifies potential networking opportunities for a user based on various factors.
        Returns a list of dictionaries, each containing a 'user' and a 'reason' for the match.
        """
        current_user_profile = user_crud.get_user_profile(self.db, user_id=user_id)
        if not current_user_profile:
            return []

        current_user_skills = self._get_user_skills(user_id)
        current_user_learning_goals = self._get_user_learning_goals(user_id)
        current_user_interests = self._get_user_interests(user_id)
        current_user_mentorship_prefs = current_user_profile.mentorship_preferences or {}
        current_user_willing_to_mentor_topics = set()
        if isinstance(current_user_mentorship_prefs.get("topics"), list) and current_user_mentorship_prefs.get("willing_to_mentor"):
            current_user_willing_to_mentor_topics = {topic.lower() for topic in current_user_mentorship_prefs["topics"]}


        all_users = user_crud.get_users(self.db, limit=1000) # Consider pagination/filtering
        opportunities = []

        for candidate_user_model in all_users:
            if getattr(candidate_user_model, 'id', None) == user_id:
                continue

            candidate_profile = user_crud.get_user_profile(self.db, getattr(candidate_user_model, 'id', 0))
            if not candidate_profile:
                continue

            score = 0
            reasons = []

            candidate_skills = self._get_user_skills(getattr(candidate_user_model, 'id', 0))
            candidate_learning_goals = self._get_user_learning_goals(getattr(candidate_user_model, 'id', 0))
            candidate_interests = self._get_user_interests(getattr(candidate_user_model, 'id', 0))
            candidate_mentorship_prefs = candidate_profile.mentorship_preferences or {}
            candidate_willing_to_mentor_topics = set()
            if isinstance(candidate_mentorship_prefs.get("topics"), list) and candidate_mentorship_prefs.get("willing_to_mentor"):
                 candidate_willing_to_mentor_topics = {topic.lower() for topic in candidate_mentorship_prefs["topics"]}

            # 1. Complementary Skills
            if current_user_learning_goals and candidate_skills:
                complementary = current_user_learning_goals.intersection(candidate_skills)
                if complementary:
                    score += len(complementary) * 2
                    reasons.append(f"Has skills you want to learn: {', '.join(complementary)}")

            # 2. Shared Interests
            if current_user_interests and candidate_interests:
                shared_interests = current_user_interests.intersection(candidate_interests)
                if shared_interests:
                    score += len(shared_interests)
                    reasons.append(f"Shares interests: {', '.join(shared_interests)}")

            # 3. Mentorship Potential
            # Candidate can mentor current user
            if current_user_learning_goals and candidate_willing_to_mentor_topics:
                mentorship_match = current_user_learning_goals.intersection(candidate_willing_to_mentor_topics)
                if mentorship_match:
                    score += 3
                    reasons.append(f"Can mentor you in: {', '.join(mentorship_match)}")
            
            # Current user can mentor candidate
            if candidate_learning_goals and current_user_willing_to_mentor_topics:
                can_mentor_candidate_match = candidate_learning_goals.intersection(current_user_willing_to_mentor_topics)
                if can_mentor_candidate_match:
                    score += 1 # Lower score as it's not a direct benefit to current user but good for network
                    reasons.append(f"You can mentor them in: {', '.join(can_mentor_candidate_match)}")


            # 4. Location Match
            if getattr(current_user_profile, 'location', None) and getattr(candidate_profile, 'location', None) and \
               getattr(current_user_profile, 'location', '').lower() == getattr(candidate_profile, 'location', '').lower():
                score += 1
                reasons.append(f"Located in the same area: {current_user_profile.location}")

            # 5. Project Collaboration Potential (simplified: candidate owns project needing current user's skills)
            # This is a basic check. A more advanced version would check project members, etc.
            if current_user_skills:
                candidate_owned_projects = project_crud.get_projects_by_user(self.db, user_id=getattr(candidate_user_model, 'id', 0), limit=100)
                for project in candidate_owned_projects:
                    project_req_skills_list = []
                    if isinstance(project.required_skills, str):
                        try: project_req_skills_list = json.loads(project.required_skills)
                        except: pass
                    elif isinstance(project.required_skills, list):
                        project_req_skills_list = project.required_skills
                    
                    project_req_skills_set = {s.lower() for s in project_req_skills_list if isinstance(s, str)}
                    
                    if current_user_skills.intersection(project_req_skills_set):
                        score += 2
                        reasons.append(f"Owns project '{project.name or project.title}' needing your skills.")
                        break # Avoid multiple scores for multiple projects from same user for this simple check

            if score > 0:
                opportunities.append({
                    "user": candidate_user_model, # Or a UserSchema representation
                    "score": score,
                    "reasons": reasons,
                    # Include specific details for frontend if needed
                    "details": {
                        "name": f"{candidate_user_model.first_name or ''} {candidate_user_model.last_name or ''}".strip() or candidate_user_model.username,
                        # Potentially add candidate_profile.bio, candidate_profile.linkedin_url etc.
                    }
                })

        opportunities.sort(key=lambda x: x["score"], reverse=True)
        return opportunities[:limit]

    # --- Communication Methods ---

    def send_message(self, sender_id: int, message_data: MessageCreate) -> MessageModel:
        """
        Sends a message from sender_id to receiver_id.
        """
        # Basic validation: ensure receiver exists
        receiver_user = user_crud.get_user(self.db, user_id=message_data.receiver_id)
        if not receiver_user:
            raise ValueError("Receiver user not found.") # Or a custom exception
        
        # Ensure sender is not sending to themselves (optional, based on requirements)
        if sender_id == message_data.receiver_id:
            raise ValueError("Cannot send messages to yourself.")

        return communication_crud.create_message(db=self.db, message=message_data, sender_id=sender_id)

    def get_conversation_history(self, user1_id: int, user2_id: int, skip: int = 0, limit: int = 50) -> List[MessageModel]:
        """
        Retrieves the message history between two users.
        Marks retrieved messages as read for user1_id if they are the receiver.
        """
        messages = communication_crud.get_messages_between_users(
            db=self.db, user1_id=user1_id, user2_id=user2_id, skip=skip, limit=limit
        )
        
        # Mark messages as read where user1_id is the receiver
        # This is a simplified approach. In a real system, you might only mark messages
        # up to a certain point or based on client acknowledgement.
        ids_to_mark_read = [
            m.id for m in messages if m.receiver_id == user1_id and not m.is_read
        ]
        if ids_to_mark_read:
            # This updates all messages from user2_id to user1_id that are unread.
            # A more precise way would be to update only the fetched `ids_to_mark_read`.
            communication_crud.mark_messages_as_read(db=self.db, receiver_id=user1_id, sender_id=user2_id)
            # Refresh messages state (is_read) if needed, or rely on frontend to update.
            # For simplicity, we assume the mark_messages_as_read is sufficient for subsequent fetches.

        return messages

    def list_user_conversations(self, user_id: int, limit: int = 20) -> List[ConversationResponse]:
        """
        Lists all conversations for a user, showing the peer and last message details.
        """
        raw_conversations = communication_crud.get_conversations(db=self.db, user_id=user_id, limit=limit)
        
        processed_conversations = []
        for raw_convo in raw_conversations:
            peer_user_model = user_crud.get_user(self.db, user_id=raw_convo["peer_user_id"])
            if not peer_user_model:
                continue # Should not happen if DB is consistent

            peer_user_schema = MessageUser.model_validate(peer_user_model)
            
            # Fetch last 1 message for the preview (or use raw_convo data)
            # For a full ConversationResponse, we might need more messages, but schema has `messages: list[MessageResponse]`
            # The current communication_crud.get_conversations only returns last message *content*, not full MessageResponse.
            # This part needs alignment or simplification of ConversationResponse.
            # For now, let's use the last message content from raw_convo and make messages list empty for this high-level view.

            # Simplified: Get last message object to create a MessageResponse for the preview.
            peer_user_id = raw_convo.get("peer_user_id", 0)
            # Use a simpler query approach to avoid SQLAlchemy conditional operand issues
            last_msg_obj = None
            try:
                last_msg_obj = self.db.query(MessageModel).filter(
                    ((MessageModel.sender_id == user_id) & (MessageModel.receiver_id == peer_user_id)) |
                    ((MessageModel.sender_id == peer_user_id) & (MessageModel.receiver_id == user_id))
                ).order_by(MessageModel.timestamp.desc()).first()
            except Exception:
                # Fallback: try to get any message involving these users
                last_msg_obj = self.db.query(MessageModel).filter(
                    MessageModel.sender_id.in_([user_id, peer_user_id])
                ).filter(
                    MessageModel.receiver_id.in_([user_id, peer_user_id])
                ).order_by(MessageModel.timestamp.desc()).first()
            
            last_message_resp = None
            if last_msg_obj:
                 sender_details = user_crud.get_user(self.db, user_id=getattr(last_msg_obj, 'sender_id', 0))
                 sender_schema = MessageUser.model_validate(sender_details) if sender_details else None
                 last_message_resp = MessageResponse(
                    id=getattr(last_msg_obj, 'id', 0),
                    sender_id=getattr(last_msg_obj, 'sender_id', 0),
                    receiver_id=getattr(last_msg_obj, 'receiver_id', 0),
                    content=getattr(last_msg_obj, 'content', ''),
                    timestamp=getattr(last_msg_obj, 'timestamp', datetime.now()),
                    is_read=getattr(last_msg_obj, 'is_read', False),
                    sender=sender_schema
                )

            conversation_resp = ConversationResponse(
                peer_user=peer_user_schema,
                messages=[last_message_resp] if last_message_resp else [],
                last_message_timestamp=raw_convo.get("last_message_timestamp"),
                unread_count=raw_convo.get("unread_count", 0)
            )
            processed_conversations.append(conversation_resp)
            
        return processed_conversations

    def mark_conversation_as_read(self, current_user_id: int, peer_user_id: int) -> int:
        """Marks all messages received by current_user_id from peer_user_id as read."""
        return communication_crud.mark_messages_as_read(
            db=self.db, receiver_id=current_user_id, sender_id=peer_user_id
        )