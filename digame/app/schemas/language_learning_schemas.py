from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

# --- Translation Schemas ---
class TranslationRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Text to be translated.")
    target_language: str = Field(..., min_length=2, max_length=10, description="Target language code (e.g., 'es', 'fr', 'de').")
    source_language: Optional[str] = Field(None, min_length=2, max_length=10, description="Optional source language code (e.g., 'en').")

class TranslationResponse(BaseModel):
    original_text: str
    translated_text: str
    target_language: str
    source_language: Optional[str]
    provider: Optional[str] = None # Name of the external provider, if available
    error_message: Optional[str] = None

# --- Vocabulary Definition Schemas ---
class DefinitionRequest(BaseModel):
    word: str = Field(..., min_length=1, description="Word to be defined.")
    language: str = Field(..., min_length=2, max_length=10, description="Language code of the word (e.g., 'en', 'es').")

class DefinitionResponse(BaseModel):
    word: str
    language: str
    definition: str
    example: Optional[str] = None
    provider: Optional[str] = None # Name of the external provider, if available
    error_message: Optional[str] = None
