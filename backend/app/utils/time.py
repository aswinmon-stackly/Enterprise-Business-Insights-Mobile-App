from datetime import datetime, timezone


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def ensure_utc(dt: datetime) -> datetime:
    """SQLite (used in tests) returns naive datetimes; PostgreSQL returns aware ones."""
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
