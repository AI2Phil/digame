import pytest
from unittest.mock import MagicMock, patch, call
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List

from digame.app.services.process_note_service import identify_and_update_process_notes, _sequence_to_string, _generate_task_name
from digame.app.models.activity import Activity
from digame.app.models.process_notes import ProcessNote
from digame.app.models.user import User

# --- Helper Function Tests ---

def test_sequence_to_string():
    assert _sequence_to_string(["A", "B", "C"]) == "A -> B -> C"
    assert _sequence_to_string(["Login"]) == "Login"
    assert _sequence_to_string([]) == ""

def test_generate_task_name():
    assert _generate_task_name("A -> B -> C") == "Process: A -> B -> C"
    long_seq = " -> ".join([f"Step{i}" for i in range(20)])
    assert _generate_task_name(long_seq).startswith("Process: Step0 -> Step1 -> Step2")
    assert _generate_task_name(long_seq).endswith("...")
    assert len(_generate_task_name(long_seq)) <= 50 + len("Process: ") # Check truncation

# --- Main Service Logic Tests ---

@pytest.fixture
def mock_db_session():
    """Provides a mock SQLAlchemy session."""
    session = MagicMock(spec=Session)
    # Mock query mechanism
    session.query.return_value.filter.return_value.order_by.return_value.all.return_value = [] # Default: no activities
    session.query.return_value.filter.return_value.first.return_value = None # Default: no existing process note
    return session

@pytest.fixture
def sample_user():
    """Provides a sample User object."""
    # Not strictly needed if service only takes user_id, but useful for context
    return User(id=1, username="testuser", email="test@example.com", hashed_password="fake")

def create_mock_activity(id: int, user_id: int, activity_type: str, timestamp: datetime, details: dict = None) -> Activity:
    """Helper to create mock Activity objects."""
    act = Activity(id=id, user_id=user_id, activity_type=activity_type, timestamp=timestamp, details=details)
    # Mock the SQLAlchemy instance state if necessary for certain operations, though usually not for simple attribute access
    # act._sa_instance_state = MagicMock() 
    return act

# --- Test Scenarios ---

def test_no_activities_for_user(mock_db_session: MagicMock, sample_user: User):
    """Test behavior when a user has no activities."""
    # mock_db_session.query(Activity)...all() already returns [] by default from fixture
    
    new_count, updated_count = identify_and_update_process_notes(mock_db_session, user_id=sample_user.id)
    
    assert new_count == 0
    assert updated_count == 0
    mock_db_session.add.assert_not_called()
    mock_db_session.commit.assert_not_called()

def test_not_enough_activities_for_sequence(mock_db_session: MagicMock, sample_user: User):
    """Test behavior when activities are fewer than min_sequence_len."""
    activities = [
        create_mock_activity(1, sample_user.id, "A", datetime(2023, 1, 1, 10, 0, 0)),
        create_mock_activity(2, sample_user.id, "B", datetime(2023, 1, 1, 10, 1, 0)),
    ]
    mock_db_session.query(Activity).filter().order_by().all.return_value = activities
    
    new_count, updated_count = identify_and_update_process_notes(
        mock_db_session, 
        user_id=sample_user.id, 
        min_sequence_len=3 # Default
    )
    
    assert new_count == 0
    assert updated_count == 0

def test_new_process_note_creation(mock_db_session: MagicMock, sample_user: User):
    """Test creation of a new ProcessNote when a recurring sequence is found."""
    user_id = sample_user.id
    common_sequence = ["Login", "ViewDashboard", "EditProfile"]
    
    activities = []
    base_time = datetime(2023, 1, 1, 10, 0, 0)
    act_id_counter = 1
    
    # Create 3 instances of the sequence
    for i in range(3): # recurrence_threshold is 3 by default
        for activity_type in common_sequence:
            activities.append(create_mock_activity(act_id_counter, user_id, activity_type, base_time))
            base_time += timedelta(minutes=1)
            act_id_counter += 1
        # Add some other activities in between to make it slightly more realistic
        activities.append(create_mock_activity(act_id_counter, user_id, "Logout", base_time))
        base_time += timedelta(minutes=1)
        act_id_counter +=1

    mock_db_session.query(Activity).filter().order_by().all.return_value = activities
    # Ensure no existing ProcessNote is found for this sequence
    mock_db_session.query(ProcessNote).filter().first.return_value = None 
    
    new_count, updated_count = identify_and_update_process_notes(mock_db_session, user_id=user_id)
    
    assert new_count == 1 # One new note for the "Login -> ViewDashboard -> EditProfile" sequence
    assert updated_count == 0
    
    # Check that db.add was called once with a ProcessNote instance
    mock_db_session.add.assert_called_once()
    added_note = mock_db_session.add.call_args[0][0] # Get the object passed to add()
    
    assert isinstance(added_note, ProcessNote)
    assert added_note.user_id == user_id
    expected_sequence_str = _sequence_to_string(common_sequence)
    assert added_note.process_steps_description == expected_sequence_str
    assert added_note.inferred_task_name == _generate_task_name(expected_sequence_str)
    assert added_note.occurrence_count == 3 # Met threshold
    assert added_note.source_activity_ids == [1, 2, 3] # IDs of the first instance
    assert added_note.first_observed_at == datetime(2023, 1, 1, 10, 0, 0)
    # Last observed: Login (act_id 9, 10:08), ViewDashboard (act_id 10, 10:09), EditProfile (act_id 11, 10:10)
    assert added_note.last_observed_at == datetime(2023, 1, 1, 10, 10, 0) 
    
    mock_db_session.commit.assert_called_once()

def test_existing_process_note_update(mock_db_session: MagicMock, sample_user: User):
    """Test update of an existing ProcessNote when a pattern recurs."""
    user_id = sample_user.id
    common_sequence = ["A", "B", "C"]
    sequence_str = _sequence_to_string(common_sequence)
    
    # Simulate 4 occurrences of the sequence
    activities = []
    base_time = datetime(2023, 1, 1, 10, 0, 0)
    act_id_counter = 1
    first_instance_ids = []

    for i in range(4):
        current_instance_ids = []
        for activity_type in common_sequence:
            activity_id = act_id_counter
            activities.append(create_mock_activity(activity_id, user_id, activity_type, base_time))
            current_instance_ids.append(activity_id)
            base_time += timedelta(minutes=1)
            act_id_counter += 1
        if i == 0:
            first_instance_ids = current_instance_ids

    mock_db_session.query(Activity).filter().order_by().all.return_value = activities
    
    # Simulate an existing ProcessNote for this sequence
    existing_note = ProcessNote(
        id=101,
        user_id=user_id,
        inferred_task_name=_generate_task_name(sequence_str),
        process_steps_description=sequence_str,
        source_activity_ids=first_instance_ids, # From a previous run
        occurrence_count=3, # Old count
        first_observed_at=datetime(2023, 1, 1, 9, 0, 0), # Old timestamp
        last_observed_at=datetime(2023, 1, 1, 9, 58, 0) # Old timestamp
    )
    mock_db_session.query(ProcessNote).filter().first.return_value = existing_note
    
    new_count, updated_count = identify_and_update_process_notes(mock_db_session, user_id=user_id)
    
    assert new_count == 0
    assert updated_count == 1 # One note updated
    
    mock_db_session.add.assert_not_called() # No new notes added
    assert existing_note.occurrence_count == 4 # Updated count
    # Last observed: A (id 10, 10:09), B (id 11, 10:10), C (id 12, 10:11)
    assert existing_note.last_observed_at == datetime(2023, 1, 1, 10, 11, 0) 
    # First observed and source_activity_ids should not change if we only update count and last_observed_at
    assert existing_note.first_observed_at == datetime(2023, 1, 1, 9, 0, 0) 
    assert existing_note.source_activity_ids == first_instance_ids

    mock_db_session.commit.assert_called_once()

def test_multiple_patterns_found(mock_db_session: MagicMock, sample_user: User):
    """Test handling of multiple distinct patterns meeting criteria."""
    user_id = sample_user.id
    seq1 = ["Open", "Read", "Reply"] # 3 times
    seq2 = ["Search", "View", "Download", "Close"] # 3 times
    
    activities = []
    base_time = datetime(2023, 1, 1, 12, 0, 0)
    act_id_counter = 1

    # Create instances of seq1
    for _ in range(3):
        for act_type in seq1:
            activities.append(create_mock_activity(act_id_counter, user_id, act_type, base_time))
            act_id_counter +=1; base_time += timedelta(seconds=30)
    
    # Create instances of seq2
    for _ in range(3):
        for act_type in seq2:
            activities.append(create_mock_activity(act_id_counter, user_id, act_type, base_time))
            act_id_counter +=1; base_time += timedelta(seconds=30)

    mock_db_session.query(Activity).filter().order_by().all.return_value = activities
    # Simulate no existing notes, so both should be created
    mock_db_session.query(ProcessNote).filter().first.side_effect = [None, None] # First call for seq1, second for seq2

    new_count, updated_count = identify_and_update_process_notes(mock_db_session, user_id=user_id)

    assert new_count == 2 # Two new notes
    assert updated_count == 0
    assert mock_db_session.add.call_count == 2
    mock_db_session.commit.assert_called_once()

def test_sequence_length_constraints(mock_db_session: MagicMock, sample_user: User):
    """Test that only sequences within min/max length are processed."""
    user_id = sample_user.id
    activities = [
        create_mock_activity(1, user_id, "A", datetime(2023,1,1,10,0)), # A,B (too short if min_len=3)
        create_mock_activity(2, user_id, "B", datetime(2023,1,1,10,1)),
        create_mock_activity(3, user_id, "C", datetime(2023,1,1,10,2)), # A,B,C (valid if min_len=3)
        create_mock_activity(4, user_id, "D", datetime(2023,1,1,10,3)), # B,C,D (valid) C,D,E (valid)
        create_mock_activity(5, user_id, "E", datetime(2023,1,1,10,4)), # D,E,F (valid)
        create_mock_activity(6, user_id, "F", datetime(2023,1,1,10,5)), # E,F,G (valid)
        create_mock_activity(7, user_id, "G", datetime(2023,1,1,10,6)), # F,G,H (valid)
        create_mock_activity(8, user_id, "H", datetime(2023,1,1,10,7)), # G,H,I (valid)
        # Create 3 occurrences of A,B,C
        create_mock_activity(9, user_id, "A", datetime(2023,1,1,11,0)),
        create_mock_activity(10, user_id, "B", datetime(2023,1,1,11,1)),
        create_mock_activity(11, user_id, "C", datetime(2023,1,1,11,2)),
        create_mock_activity(12, user_id, "A", datetime(2023,1,1,12,0)),
        create_mock_activity(13, user_id, "B", datetime(2023,1,1,12,1)),
        create_mock_activity(14, user_id, "C", datetime(2023,1,1,12,2)),
    ]
    mock_db_session.query(Activity).filter().order_by().all.return_value = activities
    mock_db_session.query(ProcessNote).filter().first.return_value = None # No existing notes

    # Test with min_len=3, max_len=3, threshold=3
    new_count, _ = identify_and_update_process_notes(mock_db_session, user_id, min_sequence_len=3, max_sequence_len=3, recurrence_threshold=3)
    
    assert new_count == 1 # Only "A -> B -> C" should be found 3 times
    added_note = mock_db_session.add.call_args[0][0]
    assert added_note.process_steps_description == "A -> B -> C"

    # Reset mocks for next call
    mock_db_session.reset_mock()
    mock_db_session.query(Activity).filter().order_by().all.return_value = activities # Re-assign activities
    mock_db_session.query(ProcessNote).filter().first.return_value = None

    # Test with min_len=2, max_len=2, threshold=1 (expect many, but logic focuses on threshold >=3 in other tests)
    # For this specific test, let's use threshold=1 to see if it picks up shorter sequences
    # The current implementation of identify_and_update_process_notes will find all sub-sequences.
    # We are testing if the parameters are respected.
    # Let's find A->B. It occurs 3 times in the data.
    new_count_short, _ = identify_and_update_process_notes(mock_db_session, user_id, min_sequence_len=2, max_sequence_len=2, recurrence_threshold=3)
    assert new_count_short > 0 # Expecting A->B (3 times) and B->C (3 times) etc.
    
    found_ab = False
    for call_obj in mock_db_session.add.call_args_list:
        note = call_obj[0][0]
        if note.process_steps_description == "A -> B":
            assert note.occurrence_count == 3
            found_ab = True
    assert found_ab, "Sequence A -> B was not found or not added correctly."

def test_db_commit_error_handling(mock_db_session: MagicMock, sample_user: User):
    """Test that database errors during commit are handled (e.g., rollbacked)."""
    user_id = sample_user.id
    activities = [create_mock_activity(i, user_id, chr(65+ (i%3)), datetime.now() + timedelta(minutes=i)) for i in range(9)] # A,B,C,A,B,C,A,B,C
    mock_db_session.query(Activity).filter().order_by().all.return_value = activities
    mock_db_session.query(ProcessNote).filter().first.return_value = None # New note

    # Simulate a database error during commit
    mock_db_session.commit.side_effect = Exception("Simulated DB commit error")

    with pytest.raises(Exception, match="Simulated DB commit error"):
        identify_and_update_process_notes(mock_db_session, user_id=user_id)
    
    mock_db_session.add.assert_called() # Attempted to add
    mock_db_session.commit.assert_called_once() # Attempted to commit
    mock_db_session.rollback.assert_called_once() # Rollback should be called on error
