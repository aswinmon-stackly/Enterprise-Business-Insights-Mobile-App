
from datetime import date, datetime, time, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.business_rules import MAX_TREND_RANGE_DAYS
from app.core.errors import InvalidDateRange
from app.repositories import analytics_repository as repo
from app.schemas.analytics import (
    AnalyticsComparison,
    AnalyticsKpis,
    AnalyticsOrdersSummary,
    AnalyticsOverviewResponse,
    AnalyticsTopCategory,
    DailyRevenue,
    StatusBreakdown,
)
from app.repositories.order_repository import latest_order_time
from app.utils.time import utc_now


def day_start(value: date) -> datetime:
    return datetime.combine(
        value,
        time.min,
        tzinfo=timezone.utc,
    )


def percentage_change(
    current: float,
    previous: float,
) -> float | None:
    if previous == 0:
        return None

    return round(
        ((current - previous) / previous) * 100,
        2,
    )


def get_analytics_overview(
    db: Session,
    start_date: date | None,
    end_date: date | None,
) -> AnalyticsOverviewResponse:

    anchor = (
        latest_order_time(db) or utc_now()
    ).date()

    end = end_date or anchor
    start = start_date or end - timedelta(days=6)

    if start > end:
        raise InvalidDateRange(
            "start_date must be on or before end_date."
        )

    days = (end - start).days + 1

    if days > MAX_TREND_RANGE_DAYS:
        raise InvalidDateRange(
            f"Date range cannot exceed {MAX_TREND_RANGE_DAYS} days."
        )

    current_start = day_start(start)
    current_end = day_start(end + timedelta(days=1))

    previous_start_date = start - timedelta(days=days)
    previous_end_date = start

    previous_start = day_start(previous_start_date)
    previous_end = day_start(previous_end_date)

    # Current-period database calculations
    current = repo.get_period_kpis(
        db,
        current_start,
        current_end,
    )

    # Previous-period database calculations
    previous = repo.get_period_kpis(
        db,
        previous_start,
        previous_end,
    )

    # Daily revenue
    daily = repo.get_daily_revenue(
        db,
        current_start,
        current_end,
    )

    revenue_trend = [
        DailyRevenue(
            date=start + timedelta(days=index),
            revenue=round(
                daily.get(
                    start + timedelta(days=index),
                    0.0,
                ),
                2,
            ),
        )
        for index in range(days)
    ]

    # Order status breakdown
    status_counts = repo.get_order_status_counts(
        db,
        current_start,
        current_end,
    )

    breakdown = [
        StatusBreakdown(
            status=status,
            count=count,
        )
        for status, count in status_counts.items()
    ]

    total_orders = sum(status_counts.values())

    # Top category
    category = repo.get_top_category(
        db,
        current_start,
        current_end,
    )

    top_category = None

    if category:
        top_category = AnalyticsTopCategory(
            name=category["name"],
            revenue=round(category["revenue"], 2),
            share_pct=round(
                category["revenue"] / current["revenue"] * 100,
                2,
            ) if current["revenue"] > 0 else 0,
            order_count=category["order_count"],
            items_sold=category["items_sold"],
        )

    return AnalyticsOverviewResponse(
        start_date=start,
        end_date=end,

        kpis=AnalyticsKpis(
            total_revenue=round(current["revenue"], 2),
            total_orders=current["orders"],
            total_profit=round(current["profit"], 2),
            total_customers=current["customers"],
        ),

        revenue_trend=revenue_trend,

        orders_summary=AnalyticsOrdersSummary(
            total_orders=total_orders,
            status_breakdown=breakdown,
        ),

        top_category=top_category,

        comparison=AnalyticsComparison(
            revenue_change_pct=percentage_change(
                current["revenue"],
                previous["revenue"],
            ),
            orders_change_pct=percentage_change(
                current["orders"],
                previous["orders"],
            ),
            profit_change_pct=percentage_change(
                current["profit"],
                previous["profit"],
            ),
        ),
    )
