from sqlalchemy.orm import Session

from app.models.enums import ActivityType
from app.repositories import activity_repository as repo
from app.schemas.activity import RecentActivity
from app.schemas.common import Page
from app.utils.time import ensure_utc

# Presentation mapping: stored event type -> (icon group used by the app, headline)
_PRESENTATION = {
    ActivityType.ORDER_PLACED.value: ("order", "New order received"),
    ActivityType.TARGET_UPDATED.value: ("target", "Sales target updated"),
    ActivityType.CUSTOMER_REGISTERED.value: ("customer", "New customer registered"),
    ActivityType.LOW_STOCK.value: ("alert", "Low stock warning"),
}


def list_activities(db: Session, limit: int, offset: int) -> Page[RecentActivity]:
    rows, total = repo.list_activities(db, limit=limit, offset=offset)
    items = []
    for activity, order_total in rows:
        ui_type, title = _PRESENTATION[activity.activity_type]
        items.append(RecentActivity(
            id=f"act-{activity.id}", type=ui_type, title=title, subtitle=activity.description,
            amount=float(order_total) if order_total is not None else None,
            timestamp=ensure_utc(activity.occurred_at),
        ))
    return Page[RecentActivity](items=items, total=total, limit=limit, offset=offset)
