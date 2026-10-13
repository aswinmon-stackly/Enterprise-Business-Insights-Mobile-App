from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import OrderStatus
from app.routers.deps import Pagination, pagination_params
from app.schemas.common import Page
from app.schemas.order import OrderRead
from app.services import order_service

router = APIRouter(prefix="/api", tags=["Orders"])


@router.get("/orders", response_model=Page[OrderRead], summary="List orders (newest first)")
def list_orders(
    page: Pagination = Depends(pagination_params(20, 100)),
    status: OrderStatus | None = Query(None, description="Filter by order status"),
    db: Session = Depends(get_db),
) -> Page[OrderRead]:
    return order_service.list_orders(db, page.limit, page.offset, status)
