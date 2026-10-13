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
