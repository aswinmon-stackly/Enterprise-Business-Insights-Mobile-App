from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Customer


def list_customers(db: Session, *, limit: int, offset: int, status: str | None):
    stmt, count = select(Customer), select(func.count(Customer.id))
    if status:
        stmt, count = stmt.where(Customer.status == status), count.where(Customer.status == status)
    rows = db.scalars(stmt.order_by(Customer.registered_at.desc(), Customer.id.desc()).limit(limit).offset(offset)).all()
    return list(rows), int(db.scalar(count) or 0)
