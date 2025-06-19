from typing import List, Dict, Any, Optional
from digame.app.models.user import User as UserModel # Use UserModel to avoid confusion with class User

def match_peers_by_skills( # Function name kept for now, but behavior is expanded
    current_user: UserModel,
    all_users: List[UserModel],
    match_type: str = "skills", # New parameter: "skills" or "learning_partner"
    skill_weights: Optional[Dict[str, float]] = None # Placeholder for future enhancement for skills
    # learning_goal_weights could be another param for learning_partner type
) -> List[Dict[str, Any]]:
    """
    Matches a current user with a list of other users based on selected criteria.

    Args:
        current_user: The User object for whom matches are being found.
        all_users: A list of User objects to compare against.
        match_type: Type of matching to perform:
                      - "skills": Matches based on shared skills (default).
                      - "learning_partner": Matches based on shared learning goals.
        skill_weights: Optional dictionary to weight skills (only used if match_type is "skills").

    Returns:
        A list of dictionaries, each representing a matched peer, including their
        user_id, username, peer's skills, compatibility_score, and shared criteria.
        The list is sorted by compatibility_score in descending order.
    """
    matches = []

    if match_type == "learning_partner":
        if not current_user.learning_goals: # Ensure learning_goals is a list
            return [] # No learning goals to match, so no matches for this type
        current_user_criteria_set = set(current_user.learning_goals)
    elif match_type == "skills":
        if not current_user.skills: # Ensure skills is a list
            return [] # No skills to match, so no matches for this type
        current_user_criteria_set = set(current_user.skills)
    else: # Default or unknown match_type, fallback to skills or raise error
        if not current_user.skills:
            return []
        current_user_criteria_set = set(current_user.skills)
        # Or: raise ValueError(f"Unsupported match_type: {match_type}")

    for peer_user in all_users:
        if peer_user.id == current_user.id:
            continue # Don't match user with themselves

        peer_criteria_set = set()
        if match_type == "learning_partner":
            if peer_user.learning_goals: # Ensure learning_goals is a list
                peer_criteria_set = set(peer_user.learning_goals)
            else: # Peer has no learning goals, cannot be a match for this type
                continue
        elif match_type == "skills": # Default to skills matching
            if peer_user.skills: # Ensure skills is a list
                peer_criteria_set = set(peer_user.skills)
            else: # Peer has no skills, cannot be a match for this type
                continue
        else: # Fallback for unknown type, already handled for current_user
             if peer_user.skills:
                peer_criteria_set = set(peer_user.skills)
             else:
                continue

        shared_items = current_user_criteria_set.intersection(peer_criteria_set)

        compatibility_score = 0
        if shared_items:
            if match_type == "skills" and skill_weights:
                for item in shared_items:
                    compatibility_score += skill_weights.get(item, 1.0) # Default weight 1
            else:
                # For learning_partner or non-weighted skills
                compatibility_score = len(shared_items)

        if compatibility_score > 0:
            peer_name = peer_user.username # Default to username
            if peer_user.first_name and peer_user.last_name:
                peer_name = f"{peer_user.first_name} {peer_user.last_name}"
            elif peer_user.first_name:
                peer_name = peer_user.first_name
            elif peer_user.last_name:
                 peer_name = peer_user.last_name

            # Peer's general skills are always included for informational purposes
            peer_general_skills = list(peer_user.skills) if peer_user.skills else []

            matches.append({
                "user_id": peer_user.id,
                "name": peer_name,
                "username": peer_user.username,
                "skills": peer_general_skills, # Peer's general skills
                "compatibility_score": compatibility_score,
                "match_criteria_shared": list(shared_items), # Shared items (skills or learning goals)
                "match_type_used": match_type # For clarity in debugging or on frontend
            })

    matches.sort(key=lambda x: x["compatibility_score"], reverse=True)
    return matches

# Example Usage (conceptual, for testing or direct invocation if needed)
if __name__ == "__main__":
    # Mock User class for standalone testing
    class User:
        def __init__(self, id: int, username: str,
                     skills: Optional[List[str]]=None,
                     learning_goals: Optional[List[str]]=None,
                     first_name: Optional[str]=None, last_name: Optional[str]=None):
            self.id = id
            self.username = username
            self.skills = skills if skills is not None else []
            self.learning_goals = learning_goals if learning_goals is not None else []
            self.first_name = first_name
            self.last_name = last_name

    # Sample users
    user1_skills = ["python", "fastapi", "sql"]
    user1_goals = ["kubernetes", "public speaking"]
    user1 = User(id=1, username="Alice", skills=user1_skills, learning_goals=user1_goals, first_name="Alice", last_name="Wonder")

    user2_skills = ["python", "docker", "kubernetes"]
    user2_goals = ["aws", "security"]
    user2 = User(id=2, username="Bob", skills=user2_skills, learning_goals=user2_goals, first_name="Bob", last_name="Builder")

    user3_skills = ["fastapi", "sql", "aws"]
    user3_goals = ["kubernetes", "data analysis"]
    user3 = User(id=3, username="Charlie", skills=user3_skills, learning_goals=user3_goals, first_name="Charlie", last_name="Brown")

    user4_skills = ["java", "spring"]
    user4_goals = ["python", "public speaking"] # Shares 'public speaking' with Alice
    user4 = User(id=4, username="Diana", skills=user4_skills, learning_goals=user4_goals, first_name="Diana", last_name="Prince")

    user5_no_skills_no_goals = User(id=5, username="Eve_empty", skills=[], learning_goals=[], first_name="Eve")

    user6_only_goals = User(id=6, username="Fred_learner", skills=[], learning_goals=["python", "fastapi"], first_name="Fred")
    user7_only_skills = User(id=7, username="Gina_teacher", skills=["teaching-python", "python", "fastapi"], learning_goals=[], first_name="Gina")


    all_test_users = [user1, user2, user3, user4, user5_no_skills_no_goals, user6_only_goals, user7_only_skills]

    print(f"--- SKILL-BASED Matching for {user1.username} (Skills: {user1.skills}) ---")
    matches_skills_user1 = match_peers_by_skills(user1, all_test_users, match_type="skills")
    for match in matches_skills_user1:
        print(match)

    print(f"\n--- SKILL-BASED Matching for {user1.username} with SKILL WEIGHTS ---")
    weighted_matches_user1 = match_peers_by_skills(user1, all_test_users, match_type="skills", skill_weights={"python": 2.0, "fastapi": 1.5, "sql": 1.0})
    for match in weighted_matches_user1:
        print(match)

    print(f"\n--- LEARNING PARTNER Matching for {user1.username} (Goals: {user1.learning_goals}) ---")
    matches_learning_user1 = match_peers_by_skills(user1, all_test_users, match_type="learning_partner")
    for match in matches_learning_user1:
        print(match) # Expected: Charlie (kubernetes), Diana (public speaking)

    print(f"\n--- LEARNING PARTNER Matching for {user2.username} (Goals: {user2.learning_goals}) ---")
    matches_learning_user2 = match_peers_by_skills(user2, all_test_users, match_type="learning_partner")
    for match in matches_learning_user2:
        print(match) # Expected: Charlie (aws)

    print(f"\n--- LEARNING PARTNER Matching for {user6_only_goals.username} (Goals: {user6_only_goals.learning_goals}) ---")
    # user6 wants to learn python, fastapi. User1 knows these skills. User7 knows these.
    # This test will match based on user6's learning_goals and other users' learning_goals.
    # It will NOT match user6's learning_goals with other users' skills. That's a different match type.
    matches_learning_user6 = match_peers_by_skills(user6_only_goals, all_test_users, match_type="learning_partner")
    if not matches_learning_user6:
        print(f"No learning partners found for {user6_only_goals.username} based on shared learning goals.")
    for match in matches_learning_user6:
        print(match)


    print(f"\n--- SKILL-BASED Matching for {user5_no_skills_no_goals.username} (no skills) ---")
    matches_skills_user5 = match_peers_by_skills(user5_no_skills_no_goals, all_test_users, match_type="skills")
    if not matches_skills_user5:
        print("No skill matches found, as expected (current user has no skills).")

    print(f"\n--- LEARNING PARTNER Matching for {user5_no_skills_no_goals.username} (no goals) ---")
    matches_learning_user5 = match_peers_by_skills(user5_no_skills_no_goals, all_test_users, match_type="learning_partner")
    if not matches_learning_user5:
        print("No learning partner matches found, as expected (current user has no learning goals).")

    # Test case where current user has learning goals but no one shares them
    user_unique_goals = User(id=8, username="UniqueGoalsUser", learning_goals=["quantum computing", "basket weaving"])
    all_test_users_with_unique = all_test_users + [user_unique_goals]
    print(f"\n--- LEARNING PARTNER Matching for {user_unique_goals.username} (Unique Goals: {user_unique_goals.learning_goals}) ---")
    matches_learning_unique = match_peers_by_skills(user_unique_goals, all_test_users_with_unique, match_type="learning_partner")
    if not matches_learning_unique:
        print(f"No learning partners found for {user_unique_goals.username} based on shared learning goals.")
    for match in matches_learning_unique:
        print(match)
```
