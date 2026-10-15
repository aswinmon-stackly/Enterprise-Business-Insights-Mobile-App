from dataclasses import dataclass
from datetime import date, datetime

from sqlalchemy import and_, case, distinct, func, or_, select
from sqlalchemy.orm import Session

from app.core.business_rules import QUALIFYING_STATUS_VALUES
from app.db.sql import local_day
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
    """Revenue per calendar day (business time zone) over qualifying orders in [start, end): grouped and filtered in SQL."""
    day = local_day(Order.order_date, db.get_bind().dialect.name).label("day")
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


# ---------------------------------------------------------------- analytics overview (Task 4)
Range = tuple[datetime, datetime]


@dataclass(frozen=True)
class CategorySales:
    name: str
    revenue: float
    orders: int
    units: int


def kpis_for_ranges(db: Session, current: Range, previous: Range | None) -> tuple[PeriodKpis, PeriodKpis | None]:
    """Revenue, profit, orders and customers for the current range AND the comparison range in ONE query.

    Conditional aggregation (SUM(CASE WHEN in_range ...)) lets a single scan of the qualifying order items answer
    both periods instead of running the same aggregate twice.
    """
    in_cur = and_(Order.order_date >= current[0], Order.order_date < current[1])
    in_prev = and_(Order.order_date >= previous[0], Order.order_date < previous[1]) if previous else None

    def block(cond):
        return [
            func.coalesce(func.sum(case((cond, LINE_REVENUE), else_=0)), 0),
            func.coalesce(func.sum(case((cond, LINE_PROFIT), else_=0)), 0),
            func.count(distinct(case((cond, Order.id)))),
            func.count(distinct(case((cond, Order.customer_id)))),
        ]

    columns = block(in_cur) + (block(in_prev) if in_prev is not None else [])
    row = db.execute(
        select(*columns)
        .select_from(OrderItem)
        .join(Order, Order.id == OrderItem.order_id)
        .where(Order.status.in_(QUALIFYING_STATUS_VALUES), or_(in_cur, in_prev) if in_prev is not None else in_cur)
    ).one()
    cur = PeriodKpis(float(row[0]), float(row[1]), int(row[2]), int(row[3]))
    prev = PeriodKpis(float(row[4]), float(row[5]), int(row[6]), int(row[7])) if in_prev is not None else None
    return cur, prev


def top_category(db: Session, start: datetime, end: datetime) -> CategorySales | None:
    """Ranking rule: highest revenue among qualifying orders; ties are broken by category name (A-Z)."""
    revenue = func.sum(LINE_REVENUE)
    row = db.execute(
        select(Category.name, revenue, func.count(distinct(Order.id)), func.sum(OrderItem.quantity))
        .select_from(OrderItem)
        .join(Order, Order.id == OrderItem.order_id)
        .join(Product, Product.id == OrderItem.product_id)
        .join(Category, Category.id == Product.category_id)
        .where(Order.status.in_(QUALIFYING_STATUS_VALUES), Order.order_date >= start, Order.order_date < end)
        .group_by(Category.name)
        .order_by(revenue.desc(), Category.name.asc())
        .limit(1)
    ).first()
    return CategorySales(row[0], float(row[1]), int(row[2]), int(row[3])) if row else None
