import json
from typing import Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from digame.app.db import get_db
from digame.app.auth.auth_dependencies import get_current_active_user
from digame.app.models.user import User as UserModel # Renamed to avoid confusion with User schema
from digame.app.schemas import user_setting_schemas as schemas # Alias for clarity
from digame.app.crud import user_setting_crud as crud # Alias for clarity

router = APIRouter(
    prefix="/settings",
    tags=["User Settings"],
)

def _parse_api_keys(api_keys_json: Optional[str]) -> Dict[str, str]:
    """Helper function to parse JSON string api_keys to Dict."""
    if not api_keys_json:
        return {}
    try:
        return json.loads(api_keys_json)
    except json.JSONDecodeError:
        # Or handle error appropriately, e.g., log it and return empty
        return {}

@router.get("/api-keys", response_model=schemas.UserSetting)
def get_api_keys(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
):
    """
    Retrieves API keys for the current user.
    If settings don't exist, they are created with empty API keys.
    """
    db_user_settings = crud.get_user_setting(db, user_id=current_user.id)
    if not db_user_settings:
        db_user_settings = crud.create_user_setting(
            db, user_id=current_user.id, settings=schemas.UserSettingCreate(api_keys={})
        )
    
    # Manually parse api_keys from JSON string to Dict for the response
    api_keys_dict = _parse_api_keys(db_user_settings.api_keys)
    
    # Construct the response, overriding the (potentially string) api_keys from the model
    return schemas.UserSetting(
        id=db_user_settings.id,
        user_id=db_user_settings.user_id,
        api_keys=api_keys_dict,
        created_at=db_user_settings.created_at,
        updated_at=db_user_settings.updated_at
    )

@router.post("/api-keys", response_model=schemas.UserSetting)
def update_api_keys(
    api_key_data: schemas.UserSettingUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
):
    """
    Sets or updates API keys for the current user.
    This will overwrite all keys if provided, or update specific ones if the schema supports it.
    Currently, UserSettingUpdate replaces the entire api_keys field.
    """
    db_user_settings = crud.get_user_setting(db, user_id=current_user.id)
    if db_user_settings:
        updated_settings = crud.update_user_setting(
            db, user_id=current_user.id, settings=api_key_data
        )
    else:
        # Convert UserSettingUpdate to UserSettingCreate for creation
        # This assumes api_key_data contains all necessary fields for creation if settings don't exist
        # or that UserSettingCreate can handle potentially partial data if api_key_data is partial.
        # For robust behavior, ensure api_key_data is suitable for UserSettingCreate.
        # A common pattern is UserSettingCreate(**api_key_data.dict(exclude_unset=True))
        # but UserSettingCreate expects api_keys, so if it's not in api_key_data, it will be default.
        create_data = schemas.UserSettingCreate(api_keys=api_key_data.api_keys if api_key_data.api_keys is not None else {})
        updated_settings = crud.create_user_setting(
            db, user_id=current_user.id, settings=create_data
        )
    
    if not updated_settings: # Should not happen if create/update is successful
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not update API keys")

    api_keys_dict = _parse_api_keys(updated_settings.api_keys)
    return schemas.UserSetting(
        id=updated_settings.id,
        user_id=updated_settings.user_id,
        api_keys=api_keys_dict,
        created_at=updated_settings.created_at,
        updated_at=updated_settings.updated_at
    )

@router.delete("/api-keys/{key_name}", response_model=schemas.UserSetting)
def delete_api_key(
    key_name: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
):
    """
    Deletes a specific API key by its name for the current user.
    """
    db_user_settings = crud.get_user_setting(db, user_id=current_user.id)
    if not db_user_settings or not db_user_settings.api_keys:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API key not found or no API keys set")

    api_keys_dict = _parse_api_keys(db_user_settings.api_keys)

    if key_name not in api_keys_dict:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"API key '{key_name}' not found")

    del api_keys_dict[key_name]

    # Prepare data for update_user_setting
    update_schema = schemas.UserSettingUpdate(api_keys=api_keys_dict)
    updated_settings = crud.update_user_setting(
        db, user_id=current_user.id, settings=update_schema
    )

    if not updated_settings: # Should ideally not happen if the original setting existed
         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not update API keys after deletion")

    # api_keys_dict is already the state we want for the response
    return schemas.UserSetting(
        id=updated_settings.id,
        user_id=updated_settings.user_id,
        api_keys=api_keys_dict, # Use the locally modified dict for response
        created_at=updated_settings.created_at,
        updated_at=updated_settings.updated_at
    )
