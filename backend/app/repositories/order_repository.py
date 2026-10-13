from dataclasses import dataclass
from datetime import date, datetime

from sqlalchemy import Date, distinct, func, select
from sqlalchemy.orm import Session

from app.core.business_rules import QUALIFYING_STATUS_VALUES
from app.models import Category, Customer, Order, OrderItem, Product

LINE_REVENUE = OrderItem.quantity * OrderItem.unit_price
LINE_PROFIT = OrderItem.quantity * (OrderItem.unit_price - OrderItem.unit_cost)


@dataclass(frozen=True)
class PeriodKpis:
    revenue: float
    profit: float
    orders: int
    customers: int


def order_totals_subquery():
    """One row per order: total amount and unit count, aggregated in SQL."""
    return (
        select(
            OrderItem.order_id.label("order_id"),
            func.sum(LINE_REVENUE).label("total"),
            func.sum(OrderItem.quantity).label("units"),
        )
        .group_by(OrderItem.order_id)
        .subquery()
    )


def latest_order_time(db: Session) -> datetime | None:
    return db.scalar(select(func.max(Order.order_date)))


def period_kpis(db: Session, start: datetime, end: datetime) -> PeriodKpis:
    """Revenue, profit, order count and active customers over qualifying orders in [start, end)."""
    row = db.execute(
        select(
            func.coalesce(func.sum(LINE_REVENUE), 0),
            func.coalesce(func.sum(LINE_PROFIT), 0),
            func.count(distinct(Order.id)),
            func.count(distinct(Order.customer_id)),
        )
        .select_from(OrderItem)
        .join(Order, Order.id == OrderItem.order_id)
        .where(Order.status.in_(QUALIFYING_STATUS_VALUES), Order.order_date >= start, Order.order_date < end)
    ).one()
    return PeriodKpis(float(row[0]), float(row[1]), int(row[2]), int(row[3]))


def status_counts(db: Session, start: datetime, end: datetime) -> dict[str, int]:
    rows = db.execute(
        select(Order.status, func.count(Order.id))
        .where(Order.order_date >= start, Order.order_date < end)
        .group_by(Order.status)
    ).all()
    return {r[0]: int(r[1]) for r in rows}


def daily_revenue(db: Session, start: datetime, end: datetime) -> dict[date, float]:
    """Revenue per calendar day (UTC) over qualifying orders in [start, end): grouped and filtered in SQL."""
    day = func.date(Order.order_date, type_=Date).label("day")
    rows = db.execute(
        select(day, func.sum(LINE_REVENUE))
        .select_from(OrderItem)
        .join(Order, Order.id == OrderItem.order_id)
        .where(Order.status.in_(QUALIFYING_STATUS_VALUES), Order.order_date >= start, Order.order_date < end)
        .group_by(day)
        .order_by(day)
    ).all()
    return {r[0]: float(r[1]) for r in rows}


def category_revenue(db: Session, start: datetime, end: datetime) -> list[tuple[str, float]]:
    revenue = func.sum(LINE_REVENUE)
    rows = db.execute(
        select(Category.name, revenue)
        .select_from(OrderItem)
        .join(Order, Order.id == OrderItem.order_id)
        .join(Product, Product.id == OrderItem.product_id)
        .join(Category, Category.id == Product.category_id)
        .where(Order.status.in_(QUALIFYING_STATUS_VALUES), Order.order_date >= start, Order.order_date < end)
        .group_by(Category.name)
        .order_by(revenue.desc())
    ).all()
    return [(r[0], float(r[1])) for r in rows]


def list_orders(db: Session, *, limit: int, offset: int, status: str | None):
    """Page of orders (newest first) + total count; LIMIT/OFFSET and the status filter run in SQL."""
    totals = order_totals_subquery()
    stmt = (
        select(
            Order.id, Order.order_number, Order.order_date, Order.status, Order.customer_id,
            Customer.name.label("customer_name"),
            func.coalesce(totals.c.total, 0).label("total_amount"),
            func.coalesce(totals.c.units, 0).label("item_count"),
        )
        .join(Customer, Customer.id == Order.customer_id)
        .outerjoin(totals, totals.c.order_id == Order.id)
    )
    count = select(func.count(Order.id))
    if status:
        stmt, count = stmt.where(Order.status == status), count.where(Order.status == status)
    rows = db.execute(stmt.order_by(Order.order_date.desc(), Order.id.desc()).limit(limit).offset(offset)).all()
    return rows, int(db.scalar(count) or 0)
