from datetime import datetime
from typing import Literal

from pydantic import Field

from app.schemas.common import CamelModel

UiActivityType = Literal["order", "target", "customer", "alert"]


class RecentActivity(CamelModel):
    id: str
    type: UiActivityType
    title: str
    subtitle: str
    amount: float | None = Field(default=None, ge=0, description="Rupees; present for order events")
    timestamp: datetime = Field(description="UTC ISO-8601; the client formats it as relative time")
