"""Business-time-zone helpers.

The API speaks in calendar dates ("2026-10-12"). A date range [start, end] means
    start 00:00:00 (inclusive)  ->  end + 1 day 00:00:00 (exclusive)   in the BUSINESS time zone,
which is converted to UTC instants for the SQL filter on the timestamptz column. Filtering on the raw column
(instead of on a computed local date) keeps the query index-friendly.
"""
from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo

from app.core.config import settings
from app.utils.time import ensure_utc, utc_now

BUSINESS_TZ = ZoneInfo(settings.business_timezone)


def today_local(now: datetime | None = None) -> date:
    return (now or utc_now()).astimezone(BUSINESS_TZ).date()


def local_date_of(dt: datetime) -> date:
    return ensure_utc(dt).astimezone(BUSINESS_TZ).date()


def local_range_to_utc(start: date, end: date) -> tuple[datetime, datetime]:
    """[start 00:00, end+1 00:00) in the business zone, as UTC instants."""
    lo = datetime.combine(start, time.min, tzinfo=BUSINESS_TZ).astimezone(timezone.utc)
    hi = datetime.combine(end + timedelta(days=1), time.min, tzinfo=BUSINESS_TZ).astimezone(timezone.utc)
    return lo, hi
