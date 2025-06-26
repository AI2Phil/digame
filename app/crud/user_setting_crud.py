import json
from typing import Optional, Dict

from sqlalchemy.orm import Session

from .. import models # Assuming models.__init__ exports UserSetting
from .. import schemas # Assuming schemas.__init__ exports UserSetting schemas

def get_user_setting(db: Session, user_id: int) -> Optional[models.UserSetting]:
    """
    Retrieves UserSetting for a given user_id.
    """
    return db.query(models.UserSetting).filter(models.UserSetting.user_id == user_id).first()

def create_user_setting(db: Session, user_id: int, settings: schemas.UserSettingCreate) -> models.UserSetting:
    """
    Creates a new UserSetting record associated with user_id.
    """
    api_keys_json = None
    if settings.api_keys is not None:
        api_keys_json = json.dumps(settings.api_keys)
    else:
        api_keys_json = json.dumps({}) # Store as empty JSON object string if None

    db_user_setting = models.UserSetting(
        user_id=user_id,
        api_keys=api_keys_json
    )
    db.add(db_user_setting)
    db.commit()
    db.refresh(db_user_setting)
    return db_user_setting

def update_user_setting(db: Session, user_id: int, settings: schemas.UserSettingUpdate) -> Optional[models.UserSetting]:
    """
    Updates an existing UserSetting for user_id.
    Handles partial updates.
    """
    db_user_setting = get_user_setting(db, user_id=user_id)
    if not db_user_setting:
        return None

    update_data = settings.dict(exclude_unset=True)

    if 'api_keys' in update_data:
        if update_data['api_keys'] is not None:
            db_user_setting.api_keys = json.dumps(update_data['api_keys'])
        else:
            db_user_setting.api_keys = json.dumps({}) # Store as empty JSON object string if None

    # Apply other updates if any (though UserSettingBase only has api_keys for now)
    for key, value in update_data.items():
        if key != 'api_keys': # api_keys handled above
            setattr(db_user_setting, key, value)
            
    db.commit()
    db.refresh(db_user_setting)
    return db_user_setting

def delete_user_setting(db: Session, user_id: int) -> bool:
    """
    Deletes UserSetting for user_id. Returns True if deleted, False otherwise.
    """
    db_user_setting = get_user_setting(db, user_id=user_id)
    if db_user_setting:
        db.delete(db_user_setting)
        db.commit()
        return True
    return False
