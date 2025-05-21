from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DetectedAnomalyBase(BaseModel):
    # Fields that might be common for creation or update, if those were to be added
    anomaly_type: str
    description: str
    severity_score: Optional[float] = None
    related_activity_ids: Optional[List[int]] = [] # Default to empty list
    status: str

class DetectedAnomalyResponse(DetectedAnomalyBase):
    id: int
    user_id: int # Matching User.id type (Integer)
    timestamp: datetime
    
    class Config:
        orm_mode = True
