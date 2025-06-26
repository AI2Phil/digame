import json
import os
import subprocess
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from ..crud.behavior_model_crud import get_behavioral_model, get_patterns_for_model
# Assuming BehavioralModel and Pattern schemas are implicitly handled by SQLAlchemy model attributes
# and datetime is available for isoformat.

router = APIRouter()

@router.post("/model/{model_id}", summary="Publish a behavioral model by serializing it to JSON")
async def publish_model_to_git(
    model_id: int,
    db: Session = Depends(get_db)
):
    """
    Serializes a behavioral model and its patterns to a JSON file.
    Git operations will be added in a future step.
    """
    db_model = get_behavioral_model(db, model_id=model_id)
    if db_model is None:
        raise HTTPException(status_code=404, detail=f"Behavioral model with ID {model_id} not found")

    patterns = get_patterns_for_model(db, model_id=model_id)

    model_data = {
        "id": db_model.id,
        "user_id": db_model.user_id,
        "name": db_model.name,
        "version": db_model.version,
        "algorithm": db_model.algorithm,
        "parameters": db_model.parameters, # Assumes parameters is already a dict/JSON-serializable
        "silhouette_score": db_model.silhouette_score,
        "num_clusters": db_model.num_clusters,
        "created_at": db_model.created_at.isoformat() if db_model.created_at else None,
        "updated_at": db_model.updated_at.isoformat() if db_model.updated_at else None,
    }

    patterns_data = []
    for p in patterns:
        patterns_data.append({
            "id": p.id,
            "pattern_label": p.pattern_label,
            "name": p.name,
            "description": p.description,
            "size": p.size,
            "centroid": p.centroid, # Assumes centroid is already a dict/JSON-serializable
            "representative_activities": p.representative_activities, # Assumes this is JSON-serializable
            "temporal_distribution": p.temporal_distribution, # Assumes this is JSON-serializable
            "activity_distribution": p.activity_distribution, # Assumes this is JSON-serializable
            "context_features": p.context_features, # Assumes this is JSON-serializable
            "created_at": p.created_at.isoformat() if p.created_at else None,
        })

    output_data = {
        "model": model_data,
        "patterns": patterns_data,
    }

    # Define target directory and filename
    target_dir = "published_models/"
    # Ensure version is a string and suitable for a filename
    version_str = str(db_model.version).replace(" ", "_").replace("/", "_")
    filename = f"user_{db_model.user_id}_model_{db_model.id}_version_{version_str}.json"
    filepath = os.path.join(target_dir, filename)

    # Ensure directory exists
    os.makedirs(target_dir, exist_ok=True)

    # Write JSON to file
    try:
        with open(filepath, 'w') as f:
            json.dump(output_data, f, indent=4)
    except IOError as e:
        raise HTTPException(status_code=500, detail=f"Failed to write model data to file: {e}")
    except TypeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to serialize model data to JSON: {e}")

    # Git operations
    try:
        # 1. git add
        add_command = ['git', 'add', filepath]
        add_result = subprocess.run(add_command, capture_output=True, text=True, check=False)
        if add_result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Git add failed: {add_result.stderr}")

        # 2. git commit
        commit_message = f"Publish behavioral model: {db_model.name} (ID: {model_id}) User: {db_model.user_id} Version: {version_str}"
        commit_command = ['git', 'commit', '-m', commit_message]
        commit_result = subprocess.run(commit_command, capture_output=True, text=True, check=False)
        # Handle cases where there's nothing to commit (e.g., file unchanged)
        # A common message for "nothing to commit" includes "nothing to commit, working tree clean"
        if commit_result.returncode != 0 and "nothing to commit" not in commit_result.stdout.lower() and "nothing to commit" not in commit_result.stderr.lower():
            raise HTTPException(status_code=500, detail=f"Git commit failed: {commit_result.stderr}")

        # 3. git push
        # Only push if there was something to commit
        if commit_result.returncode == 0 or ("nothing to commit" in commit_result.stdout.lower() or "nothing to commit" in commit_result.stderr.lower()):
             # If "nothing to commit", we might not need to push, but for consistency,
             # we can try, or just skip. Let's try, as a push might be needed for other reasons
             # or the remote might be ahead.
            if "nothing to commit" in commit_result.stdout.lower() or "nothing to commit" in commit_result.stderr.lower():
                # If there was nothing to commit, we can consider the "publish" successful at this point,
                # as the file content matches what's already in the repo.
                return {"message": f"Model {model_id} (version: {version_str}) content is already up-to-date in Git. File: {filepath}"}


            push_command = ['git', 'push']
            push_result = subprocess.run(push_command, capture_output=True, text=True, check=False)
            if push_result.returncode != 0:
                raise HTTPException(status_code=500, detail=f"Git push failed: {push_result.stderr}")
        else: # Should not happen if previous error handling is correct
             raise HTTPException(status_code=500, detail=f"Git commit failed before push attempt: {commit_result.stderr}")


    except Exception as e: # Catch any other unexpected errors during git operations
        # This will catch HTTPErrors from above or any other error
        if isinstance(e, HTTPException):
            raise e # Re-raise if it's already an HTTPException
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during Git operations: {str(e)}")

    return {"message": f"Model {model_id} (version: {version_str}) serialized to {filepath} and successfully published to Git."}
