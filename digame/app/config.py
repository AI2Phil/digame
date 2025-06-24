import os
from typing import Optional

class Settings:
    # OpenAI API Configuration
    # User-specific API keys are stored in UserSetting.api_keys["openai_api_key"]
    # These are global settings for accessing the OpenAI API service itself.
    OPENAI_API_BASE_URL: str = os.getenv("OPENAI_API_BASE_URL", "https://api.openai.com/v1")
    OPENAI_MODEL_NAME: str = os.getenv("OPENAI_MODEL_NAME", "gpt-3.5-turbo")

    # Example of other settings that might be in this file:
    PROJECT_NAME: str = "Digame"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Digame - Digital Professional Twin Platform"

    # Database URL (example, usually more complex)
    # DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost:5432/appdb")

    # JWT Settings (example)
    # JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "your-secret-key")
    # JWT_ALGORITHM: str = "HS256"
    # ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    # REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Tenant feature flags (could be more dynamic, e.g., from DB)
    # These are just examples if global defaults are needed.
    # Tenant-specific flags are typically managed in tenant settings/DB.
    FEATURE_WRITING_ASSISTANCE_ENABLED_DEFAULT: bool = True
    FEATURE_MEETING_INSIGHTS_ENABLED_DEFAULT: bool = True


settings = Settings()

# Log loaded settings for visibility during startup (optional)
import logging
logger = logging.getLogger(__name__)
logger.info(f"Configuration loaded: Project Name - {settings.PROJECT_NAME}, OpenAI Model - {settings.OPENAI_MODEL_NAME}")
