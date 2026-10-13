from pydantic import Field

from app.models.enums import OrderStatus
from app.schemas.activity import RecentActivity
from app.schemas.common import CamelModel


class UserSummary(CamelModel):
    name: str
    role: str


class KpiMetric(CamelModel):
    value: float = Field(description="Rupees for revenue/profit; counts otherwise")
    change: float = Field(description="% change vs the previous period; negative means down")


class Kpis(CamelModel):
    revenue: KpiMetric
    orders: KpiMetric
    customers: KpiMetric
    profit: KpiMetric


class RevenueTrendPoint(CamelModel):
    label: str = Field(description="X-axis label, e.g. 'Mon'")
    value: float = Field(ge=0, description="Revenue in rupees")


class StatusCount(CamelModel):
    status: OrderStatus
    count: int = Field(ge=0)


class OrdersSummary(CamelModel):
    total_orders: int = Field(ge=0, description="All orders placed in the period (every status)")
    average_order_value: float = Field(ge=0, description="Revenue / qualifying orders")
    fulfilment_rate: float = Field(ge=0, le=100, description="Delivered / all orders placed, percent")
    target_achieved: float = Field(ge=0, description="Revenue as % of the monthly sales target")
    status_breakdown: list[StatusCount]


class TopCategory(CamelModel):
    name: str
    revenue: float = Field(ge=0)
    share_pct: float = Field(ge=0, le=100)
    change: float


class Analytics(CamelModel):
    revenue_trend: list[RevenueTrendPoint]
    revenue_trend_change: float = Field(description="% change: revenue of the last 7x24h vs the 7x24h before")
    orders_summary: OrdersSummary
    top_category: TopCategory


class DashboardResponse(CamelModel):
    user: UserSummary
    unread_notifications: int = Field(ge=0)
    kpis: Kpis
    analytics: Analytics
    recent_activities: list[RecentActivity]
