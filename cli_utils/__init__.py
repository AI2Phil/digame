"""
CLI Safety Utilities Package

This package provides safety utilities for CLI scripts to prevent the same
database and model conflicts we resolved in the main application.
"""

from .migration_safety import (
    SafeMigrationRunner,
    create_safe_migration_runner,
    safe_upgrade,
    safe_downgrade,
    check_migration_health,
    wait_for_database,
    get_database_url_from_env
)

from .model_safety import (
    SafeModelImporter,
    ModelImportSafetyError,
    create_safe_model_importer,
    safe_import_all_models,
    validate_model_imports
)

__all__ = [
    # Migration safety
    'SafeMigrationRunner',
    'create_safe_migration_runner',
    'safe_upgrade',
    'safe_downgrade',
    'check_migration_health',
    'wait_for_database',
    'get_database_url_from_env',
    
    # Model import safety
    'SafeModelImporter',
    'ModelImportSafetyError',
    'create_safe_model_importer',
    'safe_import_all_models',
    'validate_model_imports'
]