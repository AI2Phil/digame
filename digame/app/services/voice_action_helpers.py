from typing import Optional
from datetime import datetime

def map_priority_to_score(priority_str: Optional[str]) -> Optional[float]:
    """Maps a textual priority (e.g., 'high') to a numerical score."""
    if not priority_str:
        return None
    priority_map = {
        "high": 0.9,
        "medium": 0.6,
        "low": 0.3,
    }
    return priority_map.get(priority_str.lower())

def parse_date_string(date_str: Optional[str]) -> Optional[datetime]:
    """Parses a YYYY-MM-DD string to a datetime object."""
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        # In a real scenario, might log this error or raise a specific exception
        return None
