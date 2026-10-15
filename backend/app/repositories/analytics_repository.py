
from datetime import date, datetime

from sqlalchemy import Date, distinct, func, select
from sqlalchemy.orm import Session

from app.core.business_rules import QUALIFYING_STATUS_VALUES
from app.models import (
    Category,
    Order,
    OrderItem,
    Product,
)

from app.models.enums import OrderStatus


LINE_REVENUE = OrderItem.quantity * OrderItem.unit_price

LINE_PROFIT = (
    OrderItem.quantity *
    (OrderItem.unit_price - OrderItem.unit_cost)
)


ALL_STATUSES = [
    status.value for status in OrderStatus
]


def get_period_kpis(
    db: Session,
    start: datetime,
    end: datetime,
):
    row = db.execute(
        select(
            func.coalesce(func.sum(LINE_REVENUE), 0),
            func.coalesce(func.sum(LINE_PROFIT), 0),
            func.count(distinct(Order.id)),
            func.count(distinct(Order.customer_id)),
        )
        .select_from(Order)
        .join(OrderItem, OrderItem.order_id == Order.id)
        .where(
            Order.order_date >= start,
            Order.order_date < end,
            Order.status.in_(QUALIFYING_STATUS_VALUES),
        )
    ).one()

    return {
        "revenue": float(row[0]),
        "profit": float(row[1]),
        "orders": int(row[2]),
        "customers": int(row[3]),
    }


def get_order_status_counts(
    db: Session,
    start: datetime,
    end: datetime,
):
    rows = db.execute(
        select(
            Order.status,
            func.count(Order.id),
        )
        .where(
            Order.order_date >= start,
            Order.order_date < end,
        )
        .group_by(Order.status)
    ).all()

    counts = {status: 0 for status in ALL_STATUSES}

    for status, count in rows:
        counts[status] = int(count)

    return counts


def get_daily_revenue(
    db: Session,
    start: datetime,
    end: datetime,
):
    day = func.date(
        Order.order_date,
        type_=Date,
    )

    rows = db.execute(
        select(
            day,
            func.coalesce(func.sum(LINE_REVENUE), 0),
        )
        .select_from(Order)
        .join(OrderItem, OrderItem.order_id == Order.id)
        .where(
            Order.order_date >= start,
            Order.order_date < end,
            Order.status.in_(QUALIFYING_STATUS_VALUES),
        )
        .group_by(day)
        .order_by(day)
    ).all()

    return {
        row[0]: float(row[1])
        for row in rows
    }


def get_top_category(
    db: Session,
    start: datetime,
    end: datetime,
):
    row = db.execute(
        select(
            Category.name,
            func.sum(LINE_REVENUE).label("revenue"),
            func.count(distinct(Order.id)).label("order_count"),
            func.coalesce(
                func.sum(OrderItem.quantity), 0
            ).label("items_sold"),
        )
        .select_from(Order)
        .join(OrderItem, OrderItem.order_id == Order.id)
        .join(Product, Product.id == OrderItem.product_id)
        .join(Category, Category.id == Product.category_id)
        .where(
            Order.order_date >= start,
            Order.order_date < end,
            Order.status.in_(QUALIFYING_STATUS_VALUES),
        )
        .group_by(Category.id, Category.name)
        .order_by(
            func.sum(LINE_REVENUE).desc(),
            Category.name.asc(),
        )
        .limit(1)
    ).first()

    if row is None:
        return None

    return {
        "name": row.name,
        "revenue": float(row.revenue),
        "order_count": int(row.order_count),
        "items_sold": int(row.items_sold),
    }
