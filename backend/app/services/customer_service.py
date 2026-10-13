from sqlalchemy.orm import Session

from app.models.enums import CustomerStatus
from app.repositories import customer_repository as repo
from app.schemas.common import Page
from app.schemas.customer import CustomerRead


def list_customers(db: Session, limit: int, offset: int, status: CustomerStatus | None) -> Page[CustomerRead]:
    rows, total = repo.list_customers(db, limit=limit, offset=offset, status=status.value if status else None)
    return Page[CustomerRead](items=[CustomerRead.model_validate(c) for c in rows], total=total, limit=limit, offset=offset)
