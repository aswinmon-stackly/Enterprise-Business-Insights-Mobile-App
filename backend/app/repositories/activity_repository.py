from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session

from app.models import Activity
from app.models.enums import ReferenceType
from app.repositories.order_repository import order_totals_subquery


def list_activities(db: Session, *, limit: int, offset: int):
    """Newest first. Order events are joined to their order total so the amount is never duplicated."""
    totals = order_totals_subquery()
    rows = db.execute(
        select(Activity, totals.c.total)
        .outerjoin(
            totals,
            and_(Activity.reference_type == ReferenceType.ORDER.value, Activity.reference_id == totals.c.order_id),
        )
        .order_by(Activity.occurred_at.desc(), Activity.id.desc())
        .limit(limit)
        .offset(offset)
    ).all()
    return rows, int(db.scalar(select(func.count(Activity.id))) or 0)
