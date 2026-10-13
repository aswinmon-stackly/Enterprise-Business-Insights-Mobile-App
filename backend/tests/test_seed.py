from sqlalchemy import func, select

from app.models import Activity, Customer, Order, OrderItem, Product
from scripts.seed_data import seed_database
from tests.conftest import ANCHOR


def _counts(db):
    return [db.scalar(select(func.count()).select_from(m)) for m in (Customer, Product, Order, OrderItem, Activity)]


def test_seed_is_idempotent(session_factory):
    with session_factory() as db:
        before = _counts(db)
        result = seed_database(db, ANCHOR)
        after = _counts(db)
    assert before == after
    assert sum(result.values()) == 0


def test_seed_covers_required_variety(session_factory):
    with session_factory() as db:
        statuses = set(db.scalars(select(Order.status).distinct()))
        category_count = db.scalar(select(func.count(func.distinct(Product.category_id))))
        distinct_days = db.scalar(select(func.count(func.distinct(func.date(Order.order_date)))))
    assert statuses == {"pending", "confirmed", "shipped", "delivered", "cancelled", "returned"}
    assert category_count >= 5 and distinct_days >= 60
