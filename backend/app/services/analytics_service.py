from datetime import date, datetime, time, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.business_rules import MAX_TREND_RANGE_DAYS, TREND_DAYS
from app.core.errors import InvalidDateRange
from app.repositories import order_repository as repo
from app.schemas.analytics import DailyRevenue, RevenueTrendResponse
from app.utils.time import utc_now


def _day_start(d: date) -> datetime:
    return datetime.combine(d, time.min, tzinfo=timezone.utc)


def revenue_series(db: Session, start: date, end: date) -> list[tuple[date, float]]:
    """Daily revenue for [start, end] inclusive. The DB filters and aggregates; Python only zero-fills gaps."""
    daily = repo.daily_revenue(db, _day_start(start), _day_start(end + timedelta(days=1)))
    return [(start + timedelta(days=i), daily.get(start + timedelta(days=i), 0.0)) for i in range((end - start).days + 1)]


def get_revenue_trend(db: Session, start_date: date | None, end_date: date | None) -> RevenueTrendResponse:
    anchor = (repo.latest_order_time(db) or utc_now()).date()
    end = end_date or anchor
    start = start_date or end - timedelta(days=TREND_DAYS - 1)
    if start > end:
        raise InvalidDateRange("start_date must be on or before end_date.")
    if (end - start).days + 1 > MAX_TREND_RANGE_DAYS:
        raise InvalidDateRange(f"The date range may not exceed {MAX_TREND_RANGE_DAYS} days.")
    series = revenue_series(db, start, end)
    return RevenueTrendResponse(
        start_date=start, end_date=end, interval="day",
        total_revenue=round(sum(v for _, v in series), 2),
        points=[DailyRevenue(date=d, revenue=v) for d, v in series],
    )
