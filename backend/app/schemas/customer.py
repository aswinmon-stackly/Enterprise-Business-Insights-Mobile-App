from datetime import datetime

from app.models.enums import CustomerStatus
from app.schemas.common import CamelModel


class CustomerRead(CamelModel):
    id: int
    name: str
    email: str
    status: CustomerStatus
    registered_at: datetime
