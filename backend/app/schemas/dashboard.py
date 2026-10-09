from datetime import datetime
from typing import Literal

from pydantic import Field

from app.schemas.common import CamelModel

ActivityType = Literal["order", "target", "customer", "alert"]


class UserSummary(CamelModel):
    name: str
    role: str


class KpiMetric(CamelModel):
    value: float = Field(ge=0, description="Current value (rupees for revenue/profit, counts otherwise)")
    change: float = Field(description="Percentage change vs previous period; negative means down")


class Kpis(CamelModel):
    revenue: KpiMetric
    orders: KpiMetric
    customers: KpiMetric
    profit: KpiMetric


class RevenueTrendPoint(CamelModel):
    label: str = Field(description="X-axis label, e.g. 'Mon'")
    value: float = Field(ge=0, description="Revenue in rupees")


class OrdersSummary(CamelModel):
    total_orders: int = Field(ge=0)
    average_order_value: float = Field(ge=0)
    fulfilment_rate: float = Field(ge=0, le=100, description="Percent")
    target_achieved: float = Field(ge=0, description="Percent of sales target")


class TopCategory(CamelModel):
    name: str
    revenue: float = Field(ge=0)
    share_pct: float = Field(ge=0, le=100)
    change: float


class Analytics(CamelModel):
    revenue_trend: list[RevenueTrendPoint]
    orders_summary: OrdersSummary
    top_category: TopCategory


class RecentActivity(CamelModel):
    id: str
    type: ActivityType
    title: str
    subtitle: str
    amount: float | None = Field(default=None, ge=0, description="Rupees, for order-type events")
    timestamp: datetime = Field(description="UTC ISO-8601; the client formats it as relative time")


class DashboardResponse(CamelModel):
    user: UserSummary
    unread_notifications: int = Field(ge=0)
    kpis: Kpis
    analytics: Analytics
    recent_activities: list[RecentActivity]
