from typing import Optional, Dict
from datetime import datetime
from pydantic import BaseModel, Field

class UserSettingBase(BaseModel):
    """
    Base schema for user settings.
    """
    api_keys: Optional[Dict[str, str]] = Field(None, description="Dictionary to store API keys, e.g., {'service_name': 'key_value'}")

class UserSettingCreate(UserSettingBase):
    """
    Schema for creating new user settings.
    Inherits all fields from UserSettingBase.
    """
    pass

class UserSettingUpdate(UserSettingBase):
    """
    Schema for updating existing user settings.
    Inherits all fields from UserSettingBase.
    All fields are optional by nature of Pydantic update models.
    """
    pass

class UserSetting(UserSettingBase):
    """
    Schema for returning user settings, including database-generated fields.
    """
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
