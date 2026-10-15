from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.core.business_rules import MAX_TREND_RANGE_DAYS, TREND_DAYS
from app.core.errors import InvalidDateRange
from app.core.periods import AnalyticsPreset, ComparisonPeriod
from app.models.enums import OrderStatus
from app.repositories import order_repository as repo
from app.schemas.analytics import (AnalyticsOverviewResponse, BestDay, ComparisonInfo, DailyRevenue, OverviewMetrics,
                                   PeriodInfo, RevenueTrendResponse, SalesPerformance, StatusShare, TopCategoryDetail)
from app.services import period_service
from app.services.comparison import compare
from app.utils.dates import BUSINESS_TZ, local_date_of, local_range_to_utc, today_local
from app.utils.time import utc_now


def _fill_days(start: date, end: date, daily: dict[date, float]) -> list[tuple[date, float]]:
    return [(start + timedelta(days=i), daily.get(start + timedelta(days=i), 0.0)) for i in range((end - start).days + 1)]


def revenue_series(db: Session, start: date, end: date) -> list[tuple[date, float]]:
    """Daily revenue for [start, end] inclusive (business-zone days). The DB filters and aggregates; Python only
    zero-fills days without sales."""
    daily = repo.daily_revenue(db, *local_range_to_utc(start, end))
    return _fill_days(start, end, daily)


def get_revenue_trend(db: Session, start_date: date | None, end_date: date | None) -> RevenueTrendResponse:
    anchor = local_date_of(repo.latest_order_time(db) or utc_now())
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


def get_overview(
    db: Session,
    *,
    period: AnalyticsPreset | None,
    start_date: date | None,
    end_date: date | None,
    comparison: ComparisonPeriod = ComparisonPeriod.PREVIOUS_PERIOD,
    today: date | None = None,
) -> AnalyticsOverviewResponse:
    """Four SQL queries per request, whatever the range size or comparison:
       1. KPIs for the current AND comparison range (one conditional-aggregation query)
       2. revenue per local day (GROUP BY day)
       3. top category (GROUP BY category ORDER BY revenue DESC LIMIT 1)
       4. order counts by status (GROUP BY status)
    """
    resolved = period_service.resolve_period(period, start_date, end_date, today or today_local())
    prev_dates = period_service.comparison_range(resolved, comparison)
    cur_range = local_range_to_utc(resolved.start, resolved.end)
    prev_range = local_range_to_utc(*prev_dates) if prev_dates else None

    cur, prev = repo.kpis_for_ranges(db, cur_range, prev_range)
    daily = repo.daily_revenue(db, *cur_range)
    category = repo.top_category(db, *cur_range)
    counts = repo.status_counts(db, *cur_range)

    series = _fill_days(resolved.start, resolved.end, daily)
    placed = sum(counts.values())
    breakdown = [StatusShare(status=s, count=counts.get(s.value, 0),
                             share_pct=round(counts.get(s.value, 0) / placed * 100, 1) if placed else 0.0)
                 for s in OrderStatus]
    best = max(((d, v) for d, v in series if v > 0), key=lambda t: t[1], default=None)

    return AnalyticsOverviewResponse(
        period=PeriodInfo(preset=resolved.preset, start_date=resolved.start, end_date=resolved.end,
                          days=resolved.days, timezone=BUSINESS_TZ.key),
        comparison=ComparisonInfo(type=comparison, start_date=prev_dates[0], end_date=prev_dates[1]) if prev_dates else None,
        is_empty=placed == 0,
        metrics=OverviewMetrics(
            revenue=compare(cur.revenue, prev.revenue if prev else None),
            orders=compare(cur.orders, prev.orders if prev else None),
            profit=compare(cur.profit, prev.profit if prev else None),
            customers=compare(cur.customers, prev.customers if prev else None),
        ),
        revenue_trend=[DailyRevenue(date=d, revenue=v) for d, v in series],
        order_status_breakdown=breakdown,
        top_category=TopCategoryDetail(
            name=category.name, revenue=category.revenue, orders=category.orders, units_sold=category.units,
            share_pct=round(category.revenue / cur.revenue * 100, 1) if cur.revenue else 0.0,
        ) if category else None,
        performance=SalesPerformance(
            average_order_value=round(cur.revenue / cur.orders, 2) if cur.orders else 0.0,
            profit_margin_pct=round(cur.profit / cur.revenue * 100, 1) if cur.revenue else 0.0,
            completion_rate_pct=round(counts.get(OrderStatus.DELIVERED.value, 0) / placed * 100, 1) if placed else 0.0,
            cancellation_rate_pct=round(counts.get(OrderStatus.CANCELLED.value, 0) / placed * 100, 1) if placed else 0.0,
            average_daily_revenue=round(cur.revenue / resolved.days, 2),
            best_day=BestDay(date=best[0], revenue=best[1]) if best else None,
        ),
    )
