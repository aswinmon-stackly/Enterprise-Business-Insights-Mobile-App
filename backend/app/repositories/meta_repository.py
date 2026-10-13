from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Alert, SalesTarget, User


def monthly_target(db: Session) -> float:
    return float(db.scalar(select(SalesTarget.amount).where(SalesTarget.name == "monthly")) or 0)


def current_user(db: Session) -> User | None:
    return db.scalar(select(User).order_by(User.id).limit(1))


def unread_alert_count(db: Session) -> int:
    return int(db.scalar(select(func.count(Alert.id)).where(Alert.is_read.is_(False))) or 0)
