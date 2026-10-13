from sqlalchemy.orm import Session

from app.models.enums import OrderStatus
from app.repositories import order_repository as repo
from app.schemas.common import Page
from app.schemas.order import OrderRead


def list_orders(db: Session, limit: int, offset: int, status: OrderStatus | None) -> Page[OrderRead]:
    rows, total = repo.list_orders(db, limit=limit, offset=offset, status=status.value if status else None)
    items = [OrderRead.model_validate(dict(r._mapping)) for r in rows]
    return Page[OrderRead](items=items, total=total, limit=limit, offset=offset)
