import pytest
from unittest.mock import MagicMock, patch, call, ANY
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import json

from digame.app.services.activity_feature_service import (
    generate_features_for_activity,
    generate_features_for_user_activities,
    _get_app_category,
    _get_website_category,
    _extract_project_context,
    _parse_activity_details
)
from digame.app.models.activity import Activity
from digame.app.models.activity_features import ActivityEnrichedFeature
from digame.app.models.user import User # For context, if needed

# --- Helper Function Tests ---

def test_parse_activity_details():
    assert _parse_activity_details('{"key": "value"}') == {"key": "value"}
    assert _parse_activity_details('not a json string') == {}
    assert _parse_activity_details(None) == {}
    assert _parse_activity_details('') == {}

def test_get_app_category():
    assert _get_app_category("app_usage", {"app_name": "vscode"}) == "Development"
    assert _get_app_category("app_usage", {"app_name": "Microsoft Outlook"}) == "Communication"
    assert _get_app_category("app_usage", {"app_name": "unknown_app"}) is None
    assert _get_app_category("website_visit", {"app_name": "vscode"}) is None # Wrong activity type
    assert _get_app_category("app_usage", {}) is None # No app_name

def test_get_website_category():
    assert _get_website_category("website_visit", {"url": "https://github.com/user/repo"}) == "Development"
    assert _get_website_category("website_visit", {"url": "http://www.nytimes.com/article"}) == "News"
    assert _get_website_category("website_visit", {"url": "https://unknown-site.com"}) is None
    assert _get_website_category("app_usage", {"url": "https://github.com"}) is None # Wrong activity type
    assert _get_website_category("website_visit", {}) is None # No URL

def test_extract_project_context():
    # VSCode style
    details_vscode = {"window_title": "file.py - MyProject - Visual Studio Code"}
    assert _extract_project_context("app_usage", details_vscode) == "MyProject"
    
    # IntelliJ style (simplified, actual regex might be more complex)
    details_intellij = {"window_title": "MyGreatProject - [~/Projects/MyGreatProject/src/com/example/Main.java] - IntelliJ IDEA"}
    assert _extract_project_context("app_usage", details_intellij) == "MyGreatProject"

    # File path style
    details_filepath = {"file_path": "/Users/user/Projects/ClientAProject/docs/report.docx"}
    assert _extract_project_context("file_open", details_filepath) == "ClientAProject"
    details_filepath_dev = {"file_path": "/home/user/dev/AnotherProject/main.py"}
    assert _extract_project_context("file_activity", details_filepath_dev) == "AnotherProject"
    
    assert _extract_project_context("app_usage", {"window_title": "Untitled - Notepad"}) is None
    assert _extract_project_context("file_open", {"file_path": "/etc/hosts"}) is None

# --- generate_features_for_activity Tests ---

@pytest.fixture
def sample_activity() -> Activity:
    return Activity(
        id=1, 
        user_id=1, 
        activity_type="app_usage", 
        timestamp=datetime.now(),
        details=json.dumps({"app_name": "vscode", "window_title": "file.ts - MyCoolProject - Visual Studio Code"})
    )

@pytest.fixture
def prev_enriched_feature_comm() -> ActivityEnrichedFeature:
    return ActivityEnrichedFeature(
        activity_id=0, # Belongs to a hypothetical previous activity
        app_category="Communication", 
        project_context="General",
        website_category=None,
        is_context_switch=False # Assuming previous state
    )

@pytest.fixture
def prev_enriched_feature_dev_same_proj() -> ActivityEnrichedFeature:
    return ActivityEnrichedFeature(
        activity_id=0,
        app_category="Development",
        project_context="MyCoolProject", # Same project
        website_category=None,
        is_context_switch=False
    )

def test_generate_features_for_activity_basic(sample_activity: Activity, mock_db_session: MagicMock):
    feature = generate_features_for_activity(mock_db_session, sample_activity, None)
    assert feature.activity_id == sample_activity.id
    assert feature.app_category == "Development"
    assert feature.project_context == "MyCoolProject"
    assert feature.website_category is None
    assert feature.is_context_switch is False # No previous activity

def test_generate_features_for_activity_context_switch(sample_activity: Activity, prev_enriched_feature_comm: ActivityEnrichedFeature, mock_db_session: MagicMock):
    # Current activity is "Development", previous was "Communication" -> context switch
    feature = generate_features_for_activity(mock_db_session, sample_activity, prev_enriched_feature_comm)
    assert feature.is_context_switch is True

def test_generate_features_for_activity_no_context_switch(sample_activity: Activity, prev_enriched_feature_dev_same_proj: ActivityEnrichedFeature, mock_db_session: MagicMock):
    # Current activity is "Development" (MyCoolProject), previous was "Development" (MyCoolProject) -> no switch
    feature = generate_features_for_activity(mock_db_session, sample_activity, prev_enriched_feature_dev_same_proj)
    assert feature.is_context_switch is False # App category is same, project context assumed same for this test

# --- generate_features_for_user_activities Tests ---

@pytest.fixture
def mock_db_session_for_batch():
    session = MagicMock(spec=Session)
    # To be configured by each test
    session.query.return_value.outerjoin.return_value.filter.return_value.filter.return_value.order_by.return_value.limit.return_value.all.return_value = []
    session.query.return_value.outerjoin.return_value.filter.return_value.filter.return_value.order_by.return_value.all.return_value = []
    session.query.return_value.join.return_value.filter.return_value.filter.return_value.order_by.return_value.first.return_value = None # For last_processed_activity_of_user
    session.query.return_value.filter.return_value.first.return_value = None # For previous_enriched_feature query
    return session

def test_generate_features_for_user_activities_no_new_activities(mock_db_session_for_batch: MagicMock):
    # Default mock setup returns empty list for activities_to_process
    created, updated = generate_features_for_user_activities(mock_db_session_for_batch, user_id=1)
    assert created == 0
    assert updated == 0
    mock_db_session_for_batch.add_all.assert_not_called()

def test_generate_features_for_user_activities_processes_batch(mock_db_session_for_batch: MagicMock):
    user_id = 1
    act1_details = json.dumps({"app_name": "Outlook"}) # Communication
    act2_details = json.dumps({"app_name": "VSCode", "window_title": "file.py - ProjectX - VSCode"}) # Development, ProjectX
    
    activity1 = Activity(id=1, user_id=user_id, activity_type="app_usage", details=act1_details, timestamp=datetime(2023,1,1,10,0,0))
    activity2 = Activity(id=2, user_id=user_id, activity_type="app_usage", details=act2_details, timestamp=datetime(2023,1,1,10,5,0))
    
    # Simulate activities that need processing
    activities_to_process = [activity1, activity2]
    mock_db_session_for_batch.query(Activity).outerjoin().filter().filter().order_by().all.return_value = activities_to_process
    
    # Simulate no previously processed activity for this user before this batch
    mock_db_session_for_batch.query(Activity).join().filter().filter().order_by().first.return_value = None

    created, updated = generate_features_for_user_activities(mock_db_session_for_batch, user_id=user_id)
    
    assert created == 2
    assert updated == 0
    mock_db_session_for_batch.add_all.assert_called_once()
    
    added_features = mock_db_session_for_batch.add_all.call_args[0][0]
    assert len(added_features) == 2
    
    # Feature for activity1 (Outlook)
    assert added_features[0].activity_id == 1
    assert added_features[0].app_category == "Communication"
    assert added_features[0].is_context_switch is False # First in batch, no prior from DB

    # Feature for activity2 (VSCode)
    assert added_features[1].activity_id == 2
    assert added_features[1].app_category == "Development"
    assert added_features[1].project_context == "ProjectX"
    assert added_features[1].is_context_switch is True # Switched from Communication (Outlook)
    
    mock_db_session_for_batch.commit.assert_called_once()

def test_generate_features_for_user_activities_with_prior_feature(mock_db_session_for_batch: MagicMock):
    user_id = 1
    # Prior activity (already processed and has a feature)
    prior_activity = Activity(id=0, user_id=user_id, activity_type="app_usage", details=json.dumps({"app_name": "Firefox"}), timestamp=datetime(2023,1,1,9,55,0))
    prior_feature = ActivityEnrichedFeature(activity_id=0, app_category="Browser", is_context_switch=False) # Simplified
    
    # New activity to process
    act1_details = json.dumps({"app_name": "Outlook"}) # Communication
    activity1 = Activity(id=1, user_id=user_id, activity_type="app_usage", details=act1_details, timestamp=datetime(2023,1,1,10,0,0))
    activities_to_process = [activity1]

    # Mock DB calls
    mock_db_session_for_batch.query(Activity).outerjoin().filter().filter().order_by().all.return_value = activities_to_process
    mock_db_session_for_batch.query(Activity).join().filter().filter().order_by().first.return_value = prior_activity # Last processed before batch
    mock_db_session_for_batch.query(ActivityEnrichedFeature).filter(ActivityEnrichedFeature.activity_id == prior_activity.id).first.return_value = prior_feature


    created, _ = generate_features_for_user_activities(mock_db_session_for_batch, user_id=user_id)
    assert created == 1
    added_features = mock_db_session_for_batch.add_all.call_args[0][0]
    
    # Feature for activity1 (Outlook)
    assert added_features[0].activity_id == 1
    assert added_features[0].app_category == "Communication"
    # Switched from Browser (Firefox) to Communication (Outlook)
    assert added_features[0].is_context_switch is True 

def test_generate_features_for_user_activities_db_commit_error(mock_db_session_for_batch: MagicMock):
    user_id = 1
    act1_details = json.dumps({"app_name": "Outlook"})
    activity1 = Activity(id=1, user_id=user_id, activity_type="app_usage", details=act1_details, timestamp=datetime(2023,1,1,10,0,0))
    activities_to_process = [activity1]
    mock_db_session_for_batch.query(Activity).outerjoin().filter().filter().order_by().all.return_value = activities_to_process
    mock_db_session_for_batch.query(Activity).join().filter().filter().order_by().first.return_value = None # No prior

    mock_db_session_for_batch.commit.side_effect = Exception("Simulated DB Error")

    with pytest.raises(Exception, match="Simulated DB Error"):
        generate_features_for_user_activities(mock_db_session_for_batch, user_id=user_id)
    
    mock_db_session_for_batch.add_all.assert_called_once()
    mock_db_session_for_batch.commit.assert_called_once()
    mock_db_session_for_batch.rollback.assert_called_once()
