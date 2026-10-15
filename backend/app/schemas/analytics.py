# import datetime as dt
# from typing import Literal

# from pydantic import Field

# from app.schemas.common import CamelModel


# class DailyRevenue(CamelModel):
#     date: dt.date
#     revenue: float = Field(ge=0)


# class RevenueTrendResponse(CamelModel):
#     start_date: dt.date
#     end_date: dt.date
#     interval: Literal["day"] = "day"
#     total_revenue: float
#     points: list[DailyRevenue] = Field(description="One entry per day in the range; days without sales are 0")



import datetime as dt

from pydantic import Field

from app.schemas.common import CamelModel


class DailyRevenue(CamelModel):
    date: dt.date
    revenue: float = Field(ge=0)


class RevenueTrendResponse(CamelModel):
    start_date: dt.date
    end_date: dt.date
    interval: str = "day"
    total_revenue: float
    points: list[DailyRevenue]


class AnalyticsKpis(CamelModel):
    total_revenue: float = Field(ge=0)
    total_orders: int = Field(ge=0)
    total_profit: float
    total_customers: int = Field(ge=0)


class StatusBreakdown(CamelModel):
    status: str
    count: int = Field(ge=0)


class AnalyticsOrdersSummary(CamelModel):
    total_orders: int = Field(ge=0)
    status_breakdown: list[StatusBreakdown]


class AnalyticsTopCategory(CamelModel):
    name: str
    revenue: float = Field(ge=0)
    share_pct: float = Field(ge=0, le=100)
    order_count: int = Field(ge=0)
    items_sold: int = Field(ge=0)


class AnalyticsComparison(CamelModel):
    revenue_change_pct: float | None
    orders_change_pct: float | None
    profit_change_pct: float | None


class AnalyticsOverviewResponse(CamelModel):
    start_date: dt.date
    end_date: dt.date
    kpis: AnalyticsKpis
    revenue_trend: list[DailyRevenue]
    orders_summary: AnalyticsOrdersSummary
    top_category: AnalyticsTopCategory | None
    comparison: AnalyticsComparison
