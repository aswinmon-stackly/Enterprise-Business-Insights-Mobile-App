from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import CustomerStatus
from app.routers.deps import Pagination, pagination_params
from app.schemas.common import Page
from app.schemas.customer import CustomerRead
from app.services import customer_service

router = APIRouter(prefix="/api", tags=["Customers"])


@router.get("/customers", response_model=Page[CustomerRead], summary="List customers (newest first)")
def list_customers(
    page: Pagination = Depends(pagination_params(20, 100)),
    status: CustomerStatus | None = Query(None, description="Filter by customer status"),
    db: Session = Depends(get_db),
) -> Page[CustomerRead]:
    return customer_service.list_customers(db, page.limit, page.offset, status)
