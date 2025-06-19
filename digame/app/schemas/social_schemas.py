from pydantic import BaseModel
from typing import List, Optional, Any

class MatchedUser(BaseModel):
    user_id: int
    name: str
    username: str # Added for clarity, as name can be constructed
    title: Optional[str] = None
    skills: List[str]
    compatibility_score: float
    shared_skills_with_current_user: List[str]

    class Config:
        orm_mode = True # If data is coming directly from ORM objects for some fields

class PeerMatchResponse(BaseModel):
    matches: List[MatchedUser]

# Schema for potential skill weight input, if ever needed via API
class SkillWeight(BaseModel):
    skill: str
    weight: float

class PeerMatchRequestPayload(BaseModel): # For potential future POST request
    skill_weights: Optional[List[SkillWeight]] = None
    # other potential filters if this becomes a POST
