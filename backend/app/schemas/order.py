from datetime import datetime

from pydantic import Field

from app.models.enums import OrderStatus
from app.schemas.common import CamelModel


class OrderRead(CamelModel):
    id: int
    order_number: str
    order_date: datetime
    status: OrderStatus
    customer_id: int
    customer_name: str
    item_count: int = Field(ge=0, description="Total units across the order's items")
    total_amount: float = Field(ge=0, description="SUM(quantity * unit_price)")
