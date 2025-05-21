import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from unittest.mock import patch, MagicMock
from fastapi import status

from digame.app.main import app # Main FastAPI application
from digame.app.auth.auth_dependencies import get_current_active_user # For overriding
from digame.app.models.user import User as SQLAlchemyUser
from digame.app.models.process_notes import ProcessNote as SQLAlchemyProcessNote
from digame.app.schemas.process_note_schemas import ProcessNoteResponse, ProcessDiscoveryResponse

# Fixtures test_admin_user, test_non_admin_user, db_session_test are from conftest.py
client = TestClient(app)

# --- Helper to create ProcessNote in DB for testing GET endpoints ---
def create_db_process_note(db: Session, user_id: int, note_id: int, task_name: str = "Test Task") -> SQLAlchemyProcessNote:
    note = SQLAlchemyProcessNote(
        id=note_id,
        user_id=user_id,
        inferred_task_name=task_name,
        process_steps_description="Step 1 -> Step 2",
        occurrence_count=1
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

# --- Test POST /users/{user_id}/trigger-process-discovery ---
# Permission: "trigger_own_process_discovery"

@patch("digame.app.services.process_note_service.identify_and_update_process_notes")
def test_trigger_process_discovery_authorized(
    mock_service_call: MagicMock, 
    client: TestClient, 
    test_admin_user: SQLAlchemyUser, # User with the permission
    db_session_test: Session # Ensure db session is available if service uses it, though mocked here
):
    app.dependency_overrides[get_current_active_user] = lambda: test_admin_user
    mock_service_call.return_value = (2, 1) # new_notes, updated_notes

    target_user_id = test_admin_user.id # Admin triggering for self
    response = client.post(f"/process-notes/users/{target_user_id}/trigger-process-discovery")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["message"] == f"Process discovery triggered for user {target_user_id}."
    assert data["user_id"] == target_user_id
    assert data["new_notes_created"] == 2
    assert data["notes_updated"] == 1
    mock_service_call.assert_called_once_with(db_session_test, user_id=target_user_id)
    app.dependency_overrides.clear()

@patch("digame.app.services.process_note_service.identify_and_update_process_notes")
def test_trigger_process_discovery_unauthorized_wrong_user(
    mock_service_call: MagicMock, 
    client: TestClient, 
    test_admin_user: SQLAlchemyUser # Logged in as admin
):
    # Admin user (id=test_admin_user.id) trying to trigger for another user_id (e.g., 999)
    # The endpoint has specific check: current_user.id == user_id
    app.dependency_overrides[get_current_active_user] = lambda: test_admin_user
    
    other_user_id = 999
    if test_admin_user.id == other_user_id: # Ensure different user ID
        other_user_id = 998

    response = client.post(f"/process-notes/users/{other_user_id}/trigger-process-discovery")
    
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "Not authorized to trigger process discovery for this user." in response.json()["detail"]
    mock_service_call.assert_not_called()
    app.dependency_overrides.clear()

@patch("digame.app.services.process_note_service.identify_and_update_process_notes")
def test_trigger_process_discovery_no_permission(
    mock_service_call: MagicMock, 
    client: TestClient, 
    test_non_admin_user: SQLAlchemyUser # User without the permission
):
    app.dependency_overrides[get_current_active_user] = lambda: test_non_admin_user
    target_user_id = test_non_admin_user.id # Non-admin triggering for self
    
    response = client.post(f"/process-notes/users/{target_user_id}/trigger-process-discovery")
    
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "User does not have the required 'trigger_own_process_discovery' permission." in response.json()["detail"]
    mock_service_call.assert_not_called()
    app.dependency_overrides.clear()

# --- Test GET /users/{user_id}/notes ---
# Permission: "view_own_process_notes"

def test_get_process_notes_for_user_authorized(client: TestClient, test_admin_user: SQLAlchemyUser, db_session_test: Session):
    app.dependency_overrides[get_current_active_user] = lambda: test_admin_user
    # Create some notes for this user
    create_db_process_note(db_session_test, user_id=test_admin_user.id, note_id=1)
    create_db_process_note(db_session_test, user_id=test_admin_user.id, note_id=2)

    response = client.get(f"/process-notes/users/{test_admin_user.id}/notes")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2 # Might be more if other tests created notes for this user
    assert all(item["user_id"] == test_admin_user.id for item in data)
    app.dependency_overrides.clear()

def test_get_process_notes_for_user_unauthorized_wrong_user(client: TestClient, test_admin_user: SQLAlchemyUser):
    app.dependency_overrides[get_current_active_user] = lambda: test_admin_user
    other_user_id = 999
    if test_admin_user.id == other_user_id: other_user_id = 998

    response = client.get(f"/process-notes/users/{other_user_id}/notes")
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "Not authorized to view process notes for this user." in response.json()["detail"]
    app.dependency_overrides.clear()

def test_get_process_notes_for_user_no_permission(client: TestClient, test_non_admin_user: SQLAlchemyUser):
    app.dependency_overrides[get_current_active_user] = lambda: test_non_admin_user
    response = client.get(f"/process-notes/users/{test_non_admin_user.id}/notes")
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "User does not have the required 'view_own_process_notes' permission." in response.json()["detail"]
    app.dependency_overrides.clear()

# --- Test PATCH /process-notes/{note_id}/feedback ---
# Permission: "add_feedback_own_process_notes" (and user must own the note)

def test_update_process_note_feedback_authorized_owner(client: TestClient, test_admin_user: SQLAlchemyUser, db_session_test: Session):
    # test_admin_user has "add_feedback_own_process_notes" permission
    app.dependency_overrides[get_current_active_user] = lambda: test_admin_user
    note = create_db_process_note(db_session_test, user_id=test_admin_user.id, note_id=6, task_name="Feedback Test Note")

    feedback_payload = {"user_feedback": "This is very accurate.", "user_tags": ["good", "accurate"]}
    response = client.patch(f"/process-notes/{note.id}/feedback", json=feedback_payload)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == note.id
    assert data["user_feedback"] == feedback_payload["user_feedback"]
    assert data["user_tags"] == feedback_payload["user_tags"]
    
    # Verify in DB
    db_note = db_session_test.query(SQLAlchemyProcessNote).filter_by(id=note.id).one()
    assert db_note.user_feedback == feedback_payload["user_feedback"]
    assert db_note.user_tags == feedback_payload["user_tags"]
    app.dependency_overrides.clear()

def test_update_process_note_feedback_only_tags(client: TestClient, test_admin_user: SQLAlchemyUser, db_session_test: Session):
    app.dependency_overrides[get_current_active_user] = lambda: test_admin_user
    note = create_db_process_note(db_session_test, user_id=test_admin_user.id, note_id=7, task_name="Tags Only Test")
    original_feedback = note.user_feedback # Should remain unchanged

    feedback_payload = {"user_tags": ["new_tag"]}
    response = client.patch(f"/process-notes/{note.id}/feedback", json=feedback_payload)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["user_tags"] == feedback_payload["user_tags"]
    assert data["user_feedback"] == original_feedback # Feedback should not change
    app.dependency_overrides.clear()

def test_update_process_note_feedback_only_feedback_text(client: TestClient, test_admin_user: SQLAlchemyUser, db_session_test: Session):
    app.dependency_overrides[get_current_active_user] = lambda: test_admin_user
    note = create_db_process_note(db_session_test, user_id=test_admin_user.id, note_id=8, task_name="Feedback Text Only Test",)
    note.user_tags = ["initial_tag"] # Set initial tags
    db_session_test.commit()

    feedback_payload = {"user_feedback": "Updated feedback text."}
    response = client.patch(f"/process-notes/{note.id}/feedback", json=feedback_payload)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["user_feedback"] == feedback_payload["user_feedback"]
    assert data["user_tags"] == ["initial_tag"] # Tags should not change
    app.dependency_overrides.clear()
    
def test_update_process_note_feedback_empty_payload(client: TestClient, test_admin_user: SQLAlchemyUser, db_session_test: Session):
    app.dependency_overrides[get_current_active_user] = lambda: test_admin_user
    note = create_db_process_note(db_session_test, user_id=test_admin_user.id, note_id=9)
    
    response = client.patch(f"/process-notes/{note.id}/feedback", json={}) # Empty payload
    # The router has a check for this, relying on Pydantic model validation or explicit check
    assert response.status_code == status.HTTP_400_BAD_REQUEST 
    assert "At least one field (user_feedback or user_tags) must be provided for update." in response.json()["detail"]
    app.dependency_overrides.clear()

def test_update_process_note_feedback_not_found(client: TestClient, test_admin_user: SQLAlchemyUser):
    app.dependency_overrides[get_current_active_user] = lambda: test_admin_user
    feedback_payload = {"user_feedback": "Does not matter"}
    response = client.patch("/process-notes/99999/feedback", json=feedback_payload) # Non-existent note
    assert response.status_code == status.HTTP_404_NOT_FOUND
    app.dependency_overrides.clear()

def test_update_process_note_feedback_unauthorized_not_owner(client: TestClient, test_admin_user: SQLAlchemyUser, test_non_admin_user: SQLAlchemyUser, db_session_test: Session):
    # Note belongs to non_admin_user (note_owner). test_admin_user (note_accessor) tries to update.
    # test_admin_user has the permission "add_feedback_own_process_notes", but is not the owner.
    note_owner = test_non_admin_user
    note_accessor = test_admin_user
    
    db_session_test.merge(note_owner) # Ensure owner is in session
    db_session_test.commit()
    note = create_db_process_note(db_session_test, user_id=note_owner.id, note_id=10)

    app.dependency_overrides[get_current_active_user] = lambda: note_accessor
    feedback_payload = {"user_feedback": "Attempt by non-owner"}
    response = client.patch(f"/process-notes/{note.id}/feedback", json=feedback_payload)
    
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "Not authorized to update feedback for this process note." in response.json()["detail"]
    app.dependency_overrides.clear()

def test_update_process_note_feedback_no_general_permission(client: TestClient, test_non_admin_user: SQLAlchemyUser, db_session_test: Session):
    # test_non_admin_user does not have "add_feedback_own_process_notes"
    # Create a note for this user first
    note = create_db_process_note(db_session_test, user_id=test_non_admin_user.id, note_id=11)
    
    app.dependency_overrides[get_current_active_user] = lambda: test_non_admin_user
    feedback_payload = {"user_feedback": "Attempt by user without permission"}
    response = client.patch(f"/process-notes/{note.id}/feedback", json=feedback_payload)
    
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "User does not have the required 'add_feedback_own_process_notes' permission." in response.json()["detail"]
    app.dependency_overrides.clear()

# --- Test GET /process-notes/{note_id} ---
# Permission: "view_own_process_notes" (and user must own the note)

def test_get_single_process_note_authorized_owner(client: TestClient, test_admin_user: SQLAlchemyUser, db_session_test: Session):
    app.dependency_overrides[get_current_active_user] = lambda: test_admin_user
    note = create_db_process_note(db_session_test, user_id=test_admin_user.id, note_id=3, task_name="Owned Note")

    response = client.get(f"/process-notes/{note.id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == note.id
    assert data["inferred_task_name"] == "Owned Note"
    assert data["user_id"] == test_admin_user.id
    app.dependency_overrides.clear()

def test_get_single_process_note_not_found(client: TestClient, test_admin_user: SQLAlchemyUser):
    app.dependency_overrides[get_current_active_user] = lambda: test_admin_user
    response = client.get("/process-notes/99999") # Non-existent note ID
    assert response.status_code == status.HTTP_404_NOT_FOUND
    app.dependency_overrides.clear()

def test_get_single_process_note_unauthorized_not_owner(client: TestClient, test_admin_user: SQLAlchemyUser, test_non_admin_user: SQLAlchemyUser, db_session_test: Session):
    # Note belongs to non_admin_user, but admin_user (who has view_own_process_notes) is trying to access it.
    # The endpoint logic should prevent this specific case due to user_id check.
    note_owner = test_non_admin_user # The actual owner
    note_accessor = test_admin_user   # The one trying to access, has general perm but not owner

    # Ensure test_non_admin_user exists in the DB for FK constraint if not already by fixture
    db_session_test.merge(note_owner) # Merge to ensure it's in session if detached
    db_session_test.commit()

    note = create_db_process_note(db_session_test, user_id=note_owner.id, note_id=4, task_name="Other User's Note")
    
    app.dependency_overrides[get_current_active_user] = lambda: note_accessor
    response = client.get(f"/process-notes/{note.id}")
    
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "Not authorized to view this process note." in response.json()["detail"]
    app.dependency_overrides.clear()

def test_get_single_process_note_no_general_permission(client: TestClient, test_non_admin_user: SQLAlchemyUser, db_session_test: Session):
    # User does not even have 'view_own_process_notes'
    # Create a note for this user first
    note = create_db_process_note(db_session_test, user_id=test_non_admin_user.id, note_id=5, task_name="NonAdminOwned Note")
    
    app.dependency_overrides[get_current_active_user] = lambda: test_non_admin_user
    response = client.get(f"/process-notes/{note.id}")
    
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "User does not have the required 'view_own_process_notes' permission." in response.json()["detail"]
    app.dependency_overrides.clear()
