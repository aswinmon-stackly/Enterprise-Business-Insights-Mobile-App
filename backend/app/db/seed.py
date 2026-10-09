"""Seed demo data.  Usage (from backend/):  python -m app.db.seed [--reset]"""
import argparse
import math
import random
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models import Activity, Alert, Category, Customer, Order, SalesTarget, User
from app.utils.time import utc_now

DAYS = 60
CATEGORIES = [("Consumer Electronics", 9000, 0.22), ("Home Appliances", 7000, 0.14), ("Fashion & Textiles", 1800, 0.28),
              ("Grocery & FMCG", 600, 0.26), ("Others", 1500, 0.10)]
REGIONS = ["South", "North", "West", "East"]


def seed_database(db: Session, now: datetime | None = None, seed: int = 42) -> None:
    now = now or utc_now()
    rng = random.Random(seed)

    cats = [Category(name=n) for n, _, _ in CATEGORIES]
    customers = [Customer(name=f"Customer {i:03d}", region=rng.choices(REGIONS, [4, 3, 2, 1])[0],
                          created_at=now - timedelta(days=rng.randint(30, 400))) for i in range(1, 401)]
    db.add_all(cats + customers)
    db.flush()

    orders: list[Order] = []
    n = 1000
    for offset in range(DAYS - 1, -1, -1):
        growth = 0.85 + 0.30 * ((DAYS - 1 - offset) / (DAYS - 1))  # revenue trends upward over the window
        for _ in range(rng.randint(44, 62)):
            n += 1
            idx = rng.choices(range(len(CATEGORIES)), [w for _, _, w in CATEGORIES])[0]
            amount = round(CATEGORIES[idx][1] * growth * math.exp(rng.gauss(0, 0.35)), 2)
            when = now - timedelta(days=offset, seconds=rng.randint(0, 86399))
            if when > now:
                when = now - timedelta(seconds=rng.randint(60, 3600))
            orders.append(Order(
                code=f"ORD{n}", customer_id=rng.choice(customers).id, category_id=cats[idx].id, amount=amount,
                cost=round(amount * rng.uniform(0.62, 0.82), 2),
                status=rng.choices(["delivered", "pending", "cancelled"], [93, 5, 2])[0], created_at=when))
    db.add_all(orders)

    last30 = sum(float(o.amount) for o in orders if o.created_at >= now - timedelta(days=30) and o.status != "cancelled")
    db.add(SalesTarget(name="monthly", amount=round(last30 / 0.87, -3)))  # lands at ~87% target achieved

    latest = max(orders, key=lambda o: o.created_at)
    db.add_all([
        User(name="Arjun Nair", role="Regional Sales Head"),
        Activity(type="order", title="New order received", subtitle=f"Order #{latest.code}", amount=24500, created_at=now - timedelta(minutes=6)),
        Activity(type="target", title="Sales target updated", subtitle="North Region", created_at=now - timedelta(hours=2)),
        Activity(type="customer", title="New enterprise customer", subtitle="Kaveri Textiles Pvt Ltd", created_at=now - timedelta(hours=5)),
        Activity(type="alert", title="Low stock warning", subtitle="SKU EL-2291 · Chennai warehouse", created_at=now - timedelta(hours=27)),
        Activity(type="order", title="Bulk order confirmed", subtitle="Order #ORD1019", amount=182000, created_at=now - timedelta(hours=30)),
        Alert(message="Low stock: SKU EL-2291", is_read=False, created_at=now - timedelta(hours=27)),
        Alert(message="North region target updated", is_read=False, created_at=now - timedelta(hours=2)),
        Alert(message="Refund spike detected", is_read=False, created_at=now - timedelta(hours=9)),
        Alert(message="Weekly report ready", is_read=True, created_at=now - timedelta(days=2)),
    ])
    db.commit()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true", help="drop and recreate all tables first")
    args = parser.parse_args()
    import app.models  # noqa: F401
    if args.reset:
        Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        if db.scalar(select(Order.id).limit(1)) is not None:
            print("Database already has data. Use --reset to re-seed.")
            return
        seed_database(db)
        print(f"Seeded {db.query(Order).count()} orders, {db.query(Customer).count()} customers.")


if __name__ == "__main__":
    main()
