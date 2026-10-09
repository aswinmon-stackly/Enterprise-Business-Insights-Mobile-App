"""All SQL for the dashboard lives here. No business rules, no Pydantic."""
from dataclasses import dataclass
from datetime import date, datetime

from sqlalchemy import Date, case, distinct, func, select
from sqlalchemy.orm import Session

from app.models import Activity, Alert, Category, Order, SalesTarget, User


@dataclass(frozen=True)
class PeriodTotals:
    revenue: float
    profit: float
    orders: int
    customers: int
    delivered: int


def latest_order_time(db: Session) -> datetime | None:
    return db.scalar(select(func.max(Order.created_at)))


def period_totals(db: Session, start: datetime, end: datetime) -> PeriodTotals:
    row = db.execute(
        select(
            func.coalesce(func.sum(Order.amount), 0),
            func.coalesce(func.sum(Order.amount - Order.cost), 0),
            func.count(Order.id),
            func.count(distinct(Order.customer_id)),
            func.coalesce(func.sum(case((Order.status == "delivered", 1), else_=0)), 0),
        ).where(Order.created_at >= start, Order.created_at < end, Order.status != "cancelled")
    ).one()
    return PeriodTotals(float(row[0]), float(row[1]), int(row[2]), int(row[3]), int(row[4]))


def daily_revenue(db: Session, start: datetime, end: datetime) -> dict[date, float]:
    day = func.date(Order.created_at, type_=Date).label("day")
    rows = db.execute(
        select(day, func.sum(Order.amount))
        .where(Order.created_at >= start, Order.created_at < end, Order.status != "cancelled")
        .group_by(day)
    ).all()
    return {r[0]: float(r[1]) for r in rows}


def category_revenue(db: Session, start: datetime, end: datetime) -> list[tuple[str, float]]:
    rows = db.execute(
        select(Category.name, func.sum(Order.amount).label("rev"))
        .join(Category, Category.id == Order.category_id)
        .where(Order.created_at >= start, Order.created_at < end, Order.status != "cancelled")
        .group_by(Category.name)
        .order_by(func.sum(Order.amount).desc())
    ).all()
    return [(r[0], float(r[1])) for r in rows]


def monthly_target(db: Session) -> float:
    return float(db.scalar(select(SalesTarget.amount).where(SalesTarget.name == "monthly")) or 0)


def recent_activities(db: Session, limit: int = 5) -> list[Activity]:
    return list(db.scalars(select(Activity).order_by(Activity.created_at.desc()).limit(limit)))


def unread_alert_count(db: Session) -> int:
    return int(db.scalar(select(func.count(Alert.id)).where(Alert.is_read.is_(False))) or 0)


def current_user(db: Session) -> User | None:
    return db.scalar(select(User).order_by(User.id).limit(1))
