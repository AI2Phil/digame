import json
from typing import Dict, Optional
try:
    import redis # Added for caching
    from redis import exceptions as redis_exceptions
except ImportError:
    redis = None  # type: ignore
    redis_exceptions = None  # type: ignore

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..auth.auth_dependencies import get_current_active_user
from ..models.user import User as UserModel # Renamed to avoid confusion with User schema
from ..schemas import user_setting_schemas as schemas # Alias for clarity
from ..crud import user_setting_crud as crud # Alias for clarity

router = APIRouter(
    prefix="/settings",
    tags=["User Settings"],
)

# Initialize Redis client
# For robustness, this URL should come from config in a real application.
redis_client = None
if redis is not None:
    try:
        redis_client = redis.Redis.from_url("redis://localhost:6379/0", decode_responses=False) # Store bytes/str, handle decode in app
        redis_client.ping() # Check connection
    except Exception as e:
        # Handle connection error gracefully, e.g., log and disable caching
        # For this example, we'll let it raise if it can't connect at startup,
        # or set redis_client to None and check in functions.
        # For now, let's assume it connects or allow failure at startup.
        # A more robust solution would involve a global flag or dummy client.
        print(f"Could not connect to Redis: {e}") # Or use proper logging
        redis_client = None # Fallback to no caching if connection fails

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
    Implements caching for API keys.
    """
    user_id = getattr(current_user, 'id', None)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User ID not found")
    cache_key = f"user_settings:api_keys:{user_id}"

    if redis_client:
        try:
            cached_data = redis_client.get(cache_key)
            if cached_data:
                # Data in Redis is stored as a JSON string of the dictionary
                if isinstance(cached_data, bytes):
                    api_keys_dict = json.loads(cached_data.decode('utf-8'))
                else:
                    api_keys_dict = json.loads(str(cached_data)) # Ensure it's a string
                # Construct response from cached data. Note: created_at/updated_at might be stale or not stored.
                # For simplicity, we assume api_keys is the primary cached data.
                # A more complete caching strategy might store the whole UserSetting object or relevant parts.
                # Here, we need to reconstruct the UserSetting object.
                # This requires fetching the full object if we need all fields accurately,
                # or deciding that the cache only serves the api_keys part.
                # Let's assume we need to construct a valid UserSetting response.
                # We might need to fetch the original object anyway for other fields if not all are cached.
                # For this example, we'll fetch the original object to get other fields if cache is hit.
                # This makes the cache primarily for the `api_keys` field itself.

                db_user_settings = crud.get_user_setting(db, user_id=user_id)
                if not db_user_settings: # Should not happen if cache exists, but good check
                     try:
                         create_settings = schemas.UserSettingCreate(api_keys={})  # type: ignore
                     except TypeError:
                         create_settings = schemas.UserSettingCreate()  # type: ignore
                         setattr(create_settings, 'api_keys', {})  # type: ignore
                     db_user_settings = crud.create_user_setting(
                        db, user_id=user_id, settings=create_settings
                     )

                user_setting_data = {
                    "user_id": getattr(db_user_settings, 'user_id', user_id),
                    "api_keys": api_keys_dict, # Use cached api_keys
                    "created_at": getattr(db_user_settings, 'created_at', None),
                    "updated_at": getattr(db_user_settings, 'updated_at', None)
                }
                return schemas.UserSetting(**user_setting_data)
        except Exception as e:
            # Log Redis error and fall through to DB
            print(f"Redis error during GET: {e}") # Or use proper logging
            pass # Fall through to database query

    # Cache miss or Redis error, fetch from DB
    db_user_settings = crud.get_user_setting(db, user_id=user_id)
    created_new = False
    if not db_user_settings:
        try:
            create_settings = schemas.UserSettingCreate(api_keys={})  # type: ignore
        except TypeError:
            create_settings = schemas.UserSettingCreate()  # type: ignore
            setattr(create_settings, 'api_keys', {})  # type: ignore
        db_user_settings = crud.create_user_setting(
            db, user_id=user_id, settings=create_settings
        )
        created_new = True # Flag that we created it

    api_keys_dict = _parse_api_keys(getattr(db_user_settings, 'api_keys', None))

    api_keys_value = getattr(db_user_settings, 'api_keys', None)
    if redis_client and (not created_new or api_keys_value): # Cache if found or created with actual keys
        try:
            # Cache the dictionary form, serialized to JSON string
            redis_client.set(cache_key, json.dumps(api_keys_dict), ex=3600)  # 1 hour expiry
        except Exception as e:
            print(f"Redis error during SET: {e}") # Or use proper logging
            pass # Don't fail request if cache set fails

    user_setting_data = {
        "user_id": getattr(db_user_settings, 'user_id', user_id),
        "api_keys": api_keys_dict,
        "created_at": getattr(db_user_settings, 'created_at', None),
        "updated_at": getattr(db_user_settings, 'updated_at', None)
    }
    return schemas.UserSetting(**user_setting_data)
@router.post("/api-keys", response_model=schemas.UserSetting)
def update_api_keys(
    api_key_data: schemas.UserSettingUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
):
    """
    Sets or updates API keys for the current user.
    Invalidates cache on update.
    """
    user_id = getattr(current_user, 'id', None)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User ID not found")
    
    db_user_settings = crud.get_user_setting(db, user_id=user_id)
    if db_user_settings:
        updated_settings = crud.update_user_setting(
            db, user_id=user_id, settings=api_key_data
        )
    else:
        try:
            create_data = schemas.UserSettingCreate(api_keys={})  # type: ignore
        except TypeError:
            create_data = schemas.UserSettingCreate()  # type: ignore
            setattr(create_data, 'api_keys', {})  # type: ignore
        updated_settings = crud.create_user_setting(
            db, user_id=user_id, settings=create_data
        )
    
    if not updated_settings:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not update API keys")

    # Invalidate cache
    if redis_client:
        cache_key = f"user_settings:api_keys:{user_id}"
        try:
            redis_client.delete(cache_key)
        except Exception as e:
            print(f"Redis error during DELETE (cache invalidation): {e}") # Or use proper logging
            pass # Don't fail request if cache delete fails

    api_keys_dict = _parse_api_keys(getattr(updated_settings, 'api_keys', None))
    user_setting_data = {
        "id": getattr(updated_settings, 'id', None),
        "user_id": getattr(updated_settings, 'user_id', user_id),
        "api_keys": api_keys_dict,
        "created_at": getattr(updated_settings, 'created_at', None),
        "updated_at": getattr(updated_settings, 'updated_at', None)
    }
    return schemas.UserSetting(**user_setting_data)
@router.delete("/api-keys/{key_name}", response_model=schemas.UserSetting)
def delete_api_key(
    key_name: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
):
    """
    Deletes a specific API key by its name for the current user.
    Invalidates cache on update.
    """
    user_id = getattr(current_user, 'id', None)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User ID not found")
    
    db_user_settings = crud.get_user_setting(db, user_id=user_id)
    api_keys_value = getattr(db_user_settings, 'api_keys', None) if db_user_settings else None
    if not db_user_settings or not api_keys_value:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API key not found or no API keys set")

    api_keys_dict = _parse_api_keys(api_keys_value)

    if key_name not in api_keys_dict:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"API key '{key_name}' not found")

    del api_keys_dict[key_name]

    update_schema = schemas.UserSettingUpdate(**{"api_keys": api_keys_dict})
    updated_settings = crud.update_user_setting(
        db, user_id=user_id, settings=update_schema
    )

    if not updated_settings:
         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not update API keys after deletion")

    # Invalidate cache
    if redis_client:
        cache_key = f"user_settings:api_keys:{user_id}"
        try:
            redis_client.delete(cache_key)
        except Exception as e:
            print(f"Redis error during DELETE (cache invalidation): {e}") # Or use proper logging
            pass # Don't fail request if cache delete fails

    user_setting_data = {
        "id": getattr(updated_settings, 'id', None),
        "user_id": getattr(updated_settings, 'user_id', user_id),
        "api_keys": api_keys_dict,
        "created_at": getattr(updated_settings, 'created_at', None),
        "updated_at": getattr(updated_settings, 'updated_at', None)
    }
    return schemas.UserSetting(**user_setting_data)
