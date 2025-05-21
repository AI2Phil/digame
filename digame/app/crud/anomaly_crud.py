from sqlalchemy.orm import Session
from typing import List, Optional

from digame.app.models.anomaly import DetectedAnomaly
# Assuming User.id is an integer based on previous model definitions.
# If User.id were String/UUID, the user_id type hint below would change.

def get_anomalies_by_user_id(
    db: Session, 
    user_id: int, # Matching User.id type (Integer)
    skip: int = 0, 
    limit: int = 100
) -> List[DetectedAnomaly]:
    """
    Retrieves all DetectedAnomaly entries for a given user_id with pagination.
    Orders by timestamp descending (most recent first).
    """
    return (
        db.query(DetectedAnomaly)
        .filter(DetectedAnomaly.user_id == user_id)
        .order_by(DetectedAnomaly.timestamp.desc(), DetectedAnomaly.id.desc()) # Most recent first
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_anomaly_by_id(db: Session, anomaly_id: int) -> Optional[DetectedAnomaly]:
    """
    Retrieves a specific DetectedAnomaly by its ID.
    (This might be useful for future endpoints, e.g., GET /anomalies/{anomaly_id})
    """
    return db.query(DetectedAnomaly).filter(DetectedAnomaly.id == anomaly_id).first()
