from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.periods import AnalyticsPreset, ComparisonPeriod
from app.routers.deps import get_today
from app.schemas.analytics import AnalyticsOverviewResponse, RevenueTrendResponse
from app.services import analytics_service

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get(
    "/revenue-trend",
    response_model=RevenueTrendResponse,
    summary="Daily revenue between two dates",
    description="Qualifying-order revenue per day. Defaults to the last 7 days. Every day in the range is returned "
                "(0 when there were no sales), so an empty period has the same shape as a populated one.",
    responses={422: {"description": "Invalid date or date range"}},
)
def revenue_trend(
    start_date: date | None = Query(None, description="Inclusive, YYYY-MM-DD"),
    end_date: date | None = Query(None, description="Inclusive, YYYY-MM-DD"),
    db: Session = Depends(get_db),
) -> RevenueTrendResponse:
    return analytics_service.get_revenue_trend(db, start_date, end_date)


@router.get(
    "/overview",
    response_model=AnalyticsOverviewResponse,
    summary="Analytics overview for a period, with comparison",
    description=(
        "Revenue, orders, profit and customers (qualifying orders only), daily revenue trend, order status "
        "breakdown, top category and sales indicators for the selected period, compared with a previous period.\n\n"
        "**Selecting the period:** `period=today|last_7_days|last_30_days|this_month` (resolved on the server in the "
        "business time zone, ending today), or `period=custom` with `start_date` and `end_date` (inclusive, YYYY-MM-DD). "
        "Supplying only dates implies `custom`; no parameters means `last_7_days`.\n\n"
        "**Comparison:** `previous_period` (default) is the equally long range right before the selected one; "
        "`previous_year` is the same dates a year earlier; `none` skips it. A previous value of 0 yields "
        "`changePct: null` with direction `new` (or `flat` when both are 0), never infinity.\n\n"
        "Rules: see backend/app/core/business_rules.py and the README."
    ),
    responses={422: {"description": "Invalid period, date or date range"}, 503: {"description": "Database unavailable"}},
)
def analytics_overview(
    period: AnalyticsPreset | None = Query(None, description="Preset period; omit when passing start_date/end_date"),
    start_date: date | None = Query(None, description="Custom range start, inclusive, YYYY-MM-DD"),
    end_date: date | None = Query(None, description="Custom range end, inclusive, YYYY-MM-DD"),
    comparison_period: ComparisonPeriod = Query(ComparisonPeriod.PREVIOUS_PERIOD, description="What to compare against"),
    today: date = Depends(get_today),
    db: Session = Depends(get_db),
) -> AnalyticsOverviewResponse:
    return analytics_service.get_overview(db, period=period, start_date=start_date, end_date=end_date,
                                          comparison=comparison_period, today=today)
