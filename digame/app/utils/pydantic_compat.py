"""
FastAPI/Python 3.13 compatibility utilities.
This module provides compatibility utilities for the dependency upgrade.
"""

from typing import Any, Dict

def get_model_config(from_attributes: bool = True, **kwargs) -> Dict[str, Any]:
    """
    Get model configuration for Pydantic v2.
    
    Args:
        from_attributes: Whether to enable from_attributes mode (replaces orm_mode)
        **kwargs: Additional configuration options
    
    Returns:
        Configuration dict
    """
    return {
        'from_attributes': from_attributes,
        **kwargs
    }

# Import common Pydantic components with v2 compatibility
try:
    from pydantic import field_validator, Field
    # For backward compatibility, alias field_validator as validator
    validator = field_validator
except ImportError:
    # Fallback for older versions
    from pydantic import validator, Field
    field_validator = validator

__all__ = [
    'get_model_config',
    'validator',
    'field_validator',
    'Field'
]