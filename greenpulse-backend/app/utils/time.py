from datetime import datetime, timezone
from typing import Optional


def now_utc() -> datetime:
    """
    Returns current timezone-aware UTC datetime.
    """
    return datetime.now(timezone.utc)


def parse_iso_datetime(dt_str: str) -> Optional[datetime]:
    """
    Parses ISO 8601 string into timezone-aware datetime.
    """
    try:
        dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception:
        return None


def format_iso(dt: datetime) -> str:
    """
    Formats datetime to ISO 8601 string.
    """
    return dt.isoformat()
