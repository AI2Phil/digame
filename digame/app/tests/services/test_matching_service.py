import pytest
from typing import List, Optional, Dict, Any

# Adjust import path based on actual structure; UserModel is the SQLAlchemy model
from digame.app.models.user import User as UserModel
from digame.app.services.matching_service import match_peers_by_skills

# Mock UserModel for testing purposes
class MockUser:
    def __init__(self, id: int, username: str,
                 skills: Optional[List[str]] = None,
                 learning_goals: Optional[List[str]] = None,
                 first_name: Optional[str] = None,
                 last_name: Optional[str] = None):
        self.id = id
        self.username = username
        self.first_name = first_name
        self.last_name = last_name
        self.skills = skills if skills is not None else []
        self.learning_goals = learning_goals if learning_goals is not None else []

@pytest.fixture
def current_user_fixture():
    return MockUser(
        id=1, username="CurrentUser", first_name="Current", last_name="User",
        skills=["python", "fastapi", "sql"],
        learning_goals=["kubernetes", "public speaking", "aws"]
    )

@pytest.fixture
def peer_users_fixture():
    return [
        MockUser(id=2, username="Peer1", first_name="Peer", last_name="One",
                 skills=["python", "docker"], learning_goals=["kubernetes", "security"]),
        MockUser(id=3, username="Peer2", first_name="Peer", last_name="Two",
                 skills=["fastapi", "sql", "aws"], learning_goals=["data analysis", "public speaking"]),
        MockUser(id=4, username="Peer3", first_name="Peer", last_name="Three",
                 skills=["java", "spring"], learning_goals=["python", "aws"]),
        MockUser(id=5, username="PeerNoSkills", skills=[], learning_goals=["docker"]),
        MockUser(id=6, username="PeerNoGoals", skills=["python"], learning_goals=[]),
        MockUser(id=7, username="PeerNoMatch", skills=["cobol"], learning_goals=["fortran"]),
    ]

def test_match_by_skills_basic(current_user_fixture, peer_users_fixture):
    matches = match_peers_by_skills(current_user_fixture, peer_users_fixture, match_type="skills")

    assert len(matches) > 0
    # Peer1: shares 'python' (score 1)
    # Peer2: shares 'fastapi', 'sql' (score 2)
    # Peer6: shares 'python' (score 1)

    assert matches[0]["username"] == "Peer2" # Highest score
    assert matches[0]["compatibility_score"] == 2
    assert sorted(matches[0]["match_criteria_shared"]) == sorted(["fastapi", "sql"])
    assert matches[0]["match_type_used"] == "skills"
    assert matches[0]["skills"] == ["fastapi", "sql", "aws"] # Peer's general skills

    found_peer1 = any(m["username"] == "Peer1" for m in matches)
    found_peer6 = any(m["username"] == "Peer6" for m in matches)
    assert found_peer1
    assert found_peer6

    for match in matches:
        if match["username"] == "Peer1":
            assert match["compatibility_score"] == 1
            assert match["match_criteria_shared"] == ["python"]
        if match["username"] == "Peer6":
            assert match["compatibility_score"] == 1
            assert match["match_criteria_shared"] == ["python"]


def test_match_by_skills_with_weights(current_user_fixture, peer_users_fixture):
    skill_weights = {"python": 2.0, "fastapi": 1.5, "sql": 0.5, "docker": 0.1}
    matches = match_peers_by_skills(current_user_fixture, peer_users_fixture, match_type="skills", skill_weights=skill_weights)

    # Peer1: python (2.0)
    # Peer2: fastapi (1.5), sql (0.5) -> 2.0
    # Peer6: python (2.0)
    # All three could have score 2.0, order among them might vary.

    found_peer1, found_peer2, found_peer6 = False, False, False
    for match in matches:
        if match["username"] == "Peer1":
            found_peer1 = True
            assert match["compatibility_score"] == 2.0
        elif match["username"] == "Peer2":
            found_peer2 = True
            assert match["compatibility_score"] == 2.0
        elif match["username"] == "Peer6":
            found_peer6 = True
            assert match["compatibility_score"] == 2.0
    assert all([found_peer1, found_peer2, found_peer6])


def test_match_by_learning_partners(current_user_fixture, peer_users_fixture):
    matches = match_peers_by_skills(current_user_fixture, peer_users_fixture, match_type="learning_partner")

    # CurrentUser goals: ["kubernetes", "public speaking", "aws"]
    # Peer1: "kubernetes" (score 1)
    # Peer2: "public speaking" (score 1)
    # Peer3: "aws" (score 1)

    assert len(matches) == 3
    # All have score 1, order might vary
    usernames_matched = {m["username"] for m in matches}
    assert usernames_matched == {"Peer1", "Peer2", "Peer3"}

    for match in matches:
        assert match["compatibility_score"] == 1
        assert match["match_type_used"] == "learning_partner"
        if match["username"] == "Peer1":
            assert match["match_criteria_shared"] == ["kubernetes"]
            assert match["skills"] == ["python", "docker"] # Peer's general skills
        elif match["username"] == "Peer2":
            assert match["match_criteria_shared"] == ["public speaking"]
        elif match["username"] == "Peer3":
            assert match["match_criteria_shared"] == ["aws"]


def test_no_matches_for_skills_if_current_user_no_skills(peer_users_fixture):
    current_user_no_skills = MockUser(id=10, username="NoSkillsUser", skills=[])
    matches = match_peers_by_skills(current_user_no_skills, peer_users_fixture, match_type="skills")
    assert len(matches) == 0

def test_no_matches_for_learning_if_current_user_no_goals(peer_users_fixture):
    current_user_no_goals = MockUser(id=11, username="NoGoalsUser", learning_goals=[])
    matches = match_peers_by_skills(current_user_no_goals, peer_users_fixture, match_type="learning_partner")
    assert len(matches) == 0

def test_peer_with_no_skills_is_not_matched_by_skills(current_user_fixture, peer_users_fixture):
    # PeerNoSkills (id=5) has no skills.
    matches = match_peers_by_skills(current_user_fixture, peer_users_fixture, match_type="skills")
    assert not any(m["username"] == "PeerNoSkills" for m in matches)

def test_peer_with_no_goals_is_not_matched_by_learning(current_user_fixture, peer_users_fixture):
    # PeerNoGoals (id=6) has no learning_goals.
    matches = match_peers_by_skills(current_user_fixture, peer_users_fixture, match_type="learning_partner")
    assert not any(m["username"] == "PeerNoGoals" for m in matches)

def test_unsupported_match_type_defaults_to_skills(current_user_fixture, peer_users_fixture):
    # Or it could raise an error, depending on strictness. Current impl defaults.
    matches = match_peers_by_skills(current_user_fixture, peer_users_fixture, match_type="unknown_type")
    # Should behave like skill matching
    assert len(matches) > 0
    assert matches[0]["match_type_used"] == "unknown_type" # Service passes it through
    # Check if a known skill match is present
    assert any(m["username"] == "Peer2" for m in matches)
    # This test depends on the service's behavior for unknown types.
    # The service currently defaults to skills logic if match_type is not 'learning_partner'.
    # And the match_type_used field will reflect "unknown_type".

def test_output_structure_and_peer_skills_display(current_user_fixture, peer_users_fixture):
    # Test with learning_partner match_type
    matches = match_peers_by_skills(current_user_fixture, peer_users_fixture, match_type="learning_partner")
    assert len(matches) > 0

    sample_match = matches[0]
    assert "user_id" in sample_match
    assert "name" in sample_match
    assert "username" in sample_match
    assert "skills" in sample_match  # Ensures peer's general skills are present
    assert "compatibility_score" in sample_match
    assert "match_criteria_shared" in sample_match
    assert "match_type_used" in sample_match

    # Example: Peer1 matched on "kubernetes" (learning goal)
    # Their general skills are ["python", "docker"]
    peer1_match = next((m for m in matches if m["username"] == "Peer1"), None)
    assert peer1_match is not None
    assert peer1_match["skills"] == ["python", "docker"]
    assert peer1_match["match_criteria_shared"] == ["kubernetes"]
    assert peer1_match["match_type_used"] == "learning_partner"

```
