import re
import json
from urllib.parse import urlparse
from typing import Optional, Dict, Any, List

from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import desc

from digame.app.models.activity import Activity
from digame.app.models.activity_features import ActivityEnrichedFeature

# --- Mappings (can be moved to a config file or database later) ---

APP_CATEGORY_MAPPING: Dict[str, str] = {
    "vscode": "Development",
    "visual studio code": "Development",
    "pycharm": "Development",
    "intellij idea": "Development",
    "android studio": "Development",
    "slack": "Communication",
    "microsoft teams": "Communication",
    "outlook": "Communication",
    "thunderbird": "Communication",
    "zoom": "Communication",
    "google chrome": "Browser",
    "firefox": "Browser",
    "safari": "Browser",
    "microsoft edge": "Browser",
    "word": "Productivity",
    "excel": "Productivity",
    "powerpoint": "Productivity",
    "obsidian": "Productivity",
    "notion": "Productivity",
    "terminal": "Development",
    "iterm2": "Development",
    "powershell": "Development",
    "cmd": "Development",
    "docker desktop": "Development",
    "postman": "Development",
    "figma": "Design",
    "adobe xd": "Design",
    "photoshop": "Design",
    "illustrator": "Design",
    # Add more mappings as needed
}

WEBSITE_CATEGORY_MAPPING: Dict[str, str] = {
    "github.com": "Development",
    "stackoverflow.com": "Development",
    "gitlab.com": "Development",
    "bitbucket.org": "Development",
    "developer.mozilla.org": "Development",
    "docs.python.org": "Development",
    "medium.com": "Learning", # Can be broad
    "dev.to": "Learning",
    "google.com": "Search/Utility", # Search can be part of many contexts
    "duckduckgo.com": "Search/Utility",
    "wikipedia.org": "Reference",
    "nytimes.com": "News",
    "bbc.com": "News",
    "cnn.com": "News",
    "linkedin.com": "Networking/Professional",
    "twitter.com": "Social Media",
    "facebook.com": "Social Media",
    "reddit.com": "Social Media/Forum",
    "youtube.com": "Entertainment/Learning",
    "netflix.com": "Entertainment",
    "asana.com": "Project Management",
    "jira.atlassian.com": "Project Management",
    "trello.com": "Project Management",
    # Add more mappings
}

# --- Helper for parsing details ---
def _parse_activity_details(details_str: Optional[str]) -> Dict[str, Any]:
    if not details_str:
        return {}
    try:
        # Assuming details is a JSON string.
        # If it could be other formats, more robust parsing is needed.
        return json.loads(details_str)
    except json.JSONDecodeError:
        # Log error or handle non-JSON string if necessary
        # For now, return empty dict if not valid JSON
        return {}

# --- Individual Feature Generation Logic ---

def _get_app_category(activity_type: str, details: Dict[str, Any]) -> Optional[str]:
    if activity_type == 'app_usage':
        app_name = details.get('app_name', '').lower()
        for key, category in APP_CATEGORY_MAPPING.items():
            if key in app_name:
                return category
    return None

def _get_website_category(activity_type: str, details: Dict[str, Any]) -> Optional[str]:
    if activity_type == 'website_visit':
        url_str = details.get('url')
        if url_str:
            try:
                domain = urlparse(url_str).netloc.replace("www.", "")
                return WEBSITE_CATEGORY_MAPPING.get(domain)
            except Exception: # Broad exception for URL parsing issues
                return None
    return None

def _extract_project_context(activity_type: str, details: Dict[str, Any]) -> Optional[str]:
    # Heuristic based, can be expanded significantly
    # Example: VSCode window title "file.py - ProjectName - Visual Studio Code"
    # Example: IntelliJ window title "ProjectName - [~/Projects/ProjectName/src/file.java] - IDE"
    # Example: File path "/Users/user/Projects/ProjectName/file.ext"

    if activity_type == 'app_usage':
        window_title = details.get('window_title', '')
        # Regex for VSCode-like titles or IntelliJ-like paths in titles
        # This is highly dependent on common title formats
        match_vscode = re.search(r'-\s*([^-\s][^-]+[^-\s])\s*-\s*(Visual Studio Code|VSCode)', window_title, re.IGNORECASE)
        if match_vscode:
            return match_vscode.group(1).strip()
        
        match_intellij_path = re.search(r'\[(?:[^\]]*[/|\\])?([^/|\\]+)(([/|\\][^/|\\]+)*)\]', window_title) # Extracts base folder of path in []
        if match_intellij_path:
             # This might be too specific, e.g. "ProjectName" from "[~/path/to/ProjectName/src/...]"
             # Or it might be just the file name if it's "[file.java]". Needs refinement.
             # For now, let's assume it captures a potential project name if it's a directory.
             # This regex is complex and needs testing.
             # A simpler regex might be: r"\[(?:.*[/\\])?([^/\\~]+)[/\\][^/\\~]*?\]" to capture the folder before the last one
            project_name_candidate = match_intellij_path.group(1)
            # If the path is something like .../Project/src/file.java, group(1) might be Project.
            # If it's .../Project/file.java, group(1) might be Project.
            # If it's just [file.java], group(1) is file.java - not a project.
            # This needs a list of known non-project folder names or better heuristics.
            # Let's try to get the folder name if the path contains typical project structure markers like 'src'
            if re.search(r'src|lib|include', match_intellij_path.group(2) or "", re.IGNORECASE):
                return project_name_candidate

        # Generic: if a known project root is part of the title (less reliable)
        # e.g. "MyProject - SomeApp"
        # This requires a list of known project names or more dynamic approach.

    elif activity_type in ['file_open', 'file_save', 'file_activity']: # Extend as needed
        file_path = details.get('file_path', '')
        # Assuming projects are under a known root like "/Projects/" or "\Projects\"
        # This is highly environment-specific.
        match_path = re.search(r'(?:Projects|dev|workspace)[/\\]([^/\\]+)', file_path, re.IGNORECASE)
        if match_path:
            return match_path.group(1)
            
    return None


# --- Main Service Functions ---

def generate_features_for_activity(
    db: Session, # Added db session for potential future use (e.g., fetching related data)
    activity: Activity, 
    previous_activity_enriched: Optional[ActivityEnrichedFeature] = None
) -> ActivityEnrichedFeature:
    """
    Generates enriched features for a single Activity record.
    `previous_activity_enriched` should be the enriched feature of the chronologically previous activity.
    """
    details_dict = _parse_activity_details(activity.details) # activity.details is expected to be a string

    app_cat = _get_app_category(activity.activity_type, details_dict)
    web_cat = _get_website_category(activity.activity_type, details_dict)
    proj_ctx = _extract_project_context(activity.activity_type, details_dict)
    
    is_ctx_switch = False
    if previous_activity_enriched:
        # Determine current activity's primary category (app or web)
        current_primary_category = app_cat if app_cat else web_cat # Prioritize app_cat
        
        # Determine previous activity's primary category
        previous_primary_category = previous_activity_enriched.app_category \
            if previous_activity_enriched.app_category else previous_activity_enriched.website_category
            
        if current_primary_category and previous_primary_category and \
           current_primary_category != previous_primary_category:
            is_ctx_switch = True
        # Consider project context switch as well?
        # if proj_ctx and previous_activity_enriched.project_context and \
        #    proj_ctx != previous_activity_enriched.project_context:
        #     is_ctx_switch = True # Or use a more nuanced definition of context switch

    # Create or update (if logic allows re-processing)
    # For a 1-to-1, we'd typically only create if not exists.
    # If re-processing is allowed, then fetch and update.
    
    # The problem implies creating if not exists or updating.
    # Let's assume for now this function is called when we know we need to create/update.
    # The batch function will handle the "if not exists" logic.
    
    feature = ActivityEnrichedFeature(
        activity_id=activity.id,
        app_category=app_cat,
        project_context=proj_ctx,
        website_category=web_cat,
        is_context_switch=is_ctx_switch
    )
    return feature


def generate_features_for_user_activities(
    db: Session, 
    user_id: int, # Assuming User.id is int
    limit: Optional[int] = None # Max number of activities to process
) -> Tuple[int, int]: # Returns (features_created, features_updated)
    """
    Fetches activities for a user that do not yet have enriched features,
    generates features, and saves them.
    """
    query = (
        db.query(Activity)
        .outerjoin(ActivityEnrichedFeature, Activity.id == ActivityEnrichedFeature.activity_id)
        .filter(Activity.user_id == user_id)
        .filter(ActivityEnrichedFeature.id == None) # Process only those without features
        .order_by(Activity.timestamp.asc()) # Crucial for context_switch logic
    )
    
    if limit:
        activities_to_process = query.limit(limit).all()
    else:
        activities_to_process = query.all()

    if not activities_to_process:
        return 0, 0

    created_count = 0
    updated_count = 0 # This function primarily creates, but could update if logic changes
    
    # For context switch, need the last known enriched feature of the *absolute* previous activity
    # This might not be the one immediately preceding in the current batch if there was a gap.
    # Fetch the very last processed (or existing) enriched feature for this user before this batch.
    last_processed_activity_of_user = (
        db.query(Activity)
        .join(ActivityEnrichedFeature, Activity.id == ActivityEnrichedFeature.activity_id)
        .filter(Activity.user_id == user_id)
        .filter(Activity.timestamp < activities_to_process[0].timestamp) # Before the first in current batch
        .order_by(desc(Activity.timestamp))
        .first()
    )
    
    previous_enriched_feature: Optional[ActivityEnrichedFeature] = None
    if last_processed_activity_of_user:
        # Assuming the relationship is loaded or accessible.
        # If not, need to query ActivityEnrichedFeature table directly.
        # For simplicity, let's assume it's loaded or we query it:
        previous_enriched_feature = db.query(ActivityEnrichedFeature).filter(
            ActivityEnrichedFeature.activity_id == last_processed_activity_of_user.id
        ).first()

    new_features_to_add: List[ActivityEnrichedFeature] = []

    for activity in activities_to_process:
        # The generate_features_for_activity now takes previous_activity_enriched
        enriched_feature_obj = generate_features_for_activity(
            db, activity, previous_activity_enriched=previous_enriched_feature
        )
        new_features_to_add.append(enriched_feature_obj)
        
        # Update previous_enriched_feature for the next iteration *within the batch*
        previous_enriched_feature = enriched_feature_obj 

    if new_features_to_add:
        db.add_all(new_features_to_add)
        try:
            db.commit()
            created_count = len(new_features_to_add)
        except Exception as e:
            db.rollback()
            # Log error e
            print(f"Error committing enriched features: {e}") # Replace with proper logging
            raise
            
    return created_count, updated_count # updated_count is 0 for now
