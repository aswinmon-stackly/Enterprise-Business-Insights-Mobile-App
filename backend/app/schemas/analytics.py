import datetime as dt
from typing import Literal

from pydantic import Field

from app.schemas.common import CamelModel


class DailyRevenue(CamelModel):
    date: dt.date
    revenue: float = Field(ge=0)


class RevenueTrendResponse(CamelModel):
    start_date: dt.date
    end_date: dt.date
    interval: Literal["day"] = "day"
    total_revenue: float
    points: list[DailyRevenue] = Field(description="One entry per day in the range; days without sales are 0")


# ---------------------------------------------------------------- GET /api/analytics/overview
from app.core.periods import AnalyticsPreset, ComparisonPeriod  # noqa: E402
from app.models.enums import OrderStatus  # noqa: E402

Direction = Literal["up", "down", "flat", "new", "none"]


class PeriodInfo(CamelModel):
    preset: AnalyticsPreset
    start_date: dt.date
    end_date: dt.date
    days: int = Field(ge=1, description="Number of calendar days, inclusive")
    timezone: str = Field(description="IANA zone in which the dates and daily buckets are interpreted")


class ComparisonInfo(CamelModel):
    type: ComparisonPeriod
    start_date: dt.date
    end_date: dt.date


class MetricComparison(CamelModel):
    value: float
    previous: float | None = Field(description="Value in the comparison period; null when no comparison was requested")
    change_pct: float | None = Field(
        description="(value - previous) / |previous| * 100, rounded to 1 decimal. null when previous is 0 "
                    "(a percentage would be undefined) or no comparison was requested."
    )
    direction: Direction = Field(
        description="up/down/flat; 'new' = previous was 0 but value is not (no base to compare); 'none' = no comparison"
    )


class OverviewMetrics(CamelModel):
    revenue: MetricComparison
    orders: MetricComparison
    profit: MetricComparison
    customers: MetricComparison


class StatusShare(CamelModel):
    status: OrderStatus
    count: int = Field(ge=0)
    share_pct: float = Field(ge=0, le=100)


class TopCategoryDetail(CamelModel):
    name: str
    revenue: float = Field(ge=0)
    orders: int = Field(ge=0, description="Qualifying orders containing this category")
    units_sold: int = Field(ge=0)
    share_pct: float = Field(ge=0, le=100, description="Share of the period's total revenue")


class BestDay(CamelModel):
    date: dt.date
    revenue: float


class SalesPerformance(CamelModel):
    average_order_value: float
    profit_margin_pct: float
    completion_rate_pct: float = Field(description="delivered / all orders placed in the period")
    cancellation_rate_pct: float = Field(description="cancelled / all orders placed in the period")
    average_daily_revenue: float
    best_day: BestDay | None


class AnalyticsOverviewResponse(CamelModel):
    period: PeriodInfo
    comparison: ComparisonInfo | None
    is_empty: bool = Field(description="True when no order (of any status) was placed in the period")
    metrics: OverviewMetrics
    revenue_trend: list[DailyRevenue] = Field(description="One entry per day of the period; 0 on days without sales")
    order_status_breakdown: list[StatusShare] = Field(description="Every status, zero-filled")
    top_category: TopCategoryDetail | None
    performance: SalesPerformance
