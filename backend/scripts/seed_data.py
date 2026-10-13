"""Repeatable seed script.

    python -m scripts.seed_data                  # insert whatever is missing (safe to run any number of times)
    python -m scripts.seed_data --reset          # wipe business data first, then seed
    python -m scripts.seed_data --anchor 2026-10-12

No duplicates: every record has a natural key (category name, product SKU, customer email, order number,
user name, alert message, activity type+reference) and only keys that are not in the database yet are inserted.
Data generation is deterministic (fixed RNG seed), so a re-run proposes exactly the same records.
Prerequisite: the schema must exist (`alembic upgrade head`).
"""
import argparse
import math
import random
from dataclasses import dataclass, field
from datetime import datetime, time, timedelta, timezone

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.business_rules import QUALIFYING_STATUS_VALUES
from app.db.session import SessionLocal
from app.models import (Activity, Alert, Category, Customer, Order, OrderItem, Product, SalesTarget, User)
from app.models.enums import ActivityType, CustomerStatus, OrderStatus, ProductStatus, ReferenceType
from app.utils.time import utc_now

DAYS = 60
RNG_SEED = 42

# (category, share of purchased items)
CATEGORIES = [("Consumer Electronics", 0.12), ("Home Appliances", 0.08), ("Fashion & Textiles", 0.30),
              ("Grocery & FMCG", 0.38), ("Office & Lifestyle", 0.12)]
# sku, name, category, unit_price, cost_ratio, max_qty, status
PRODUCTS = [
    ("EL-1001", 'Smart LED TV 43"', "Consumer Electronics", 32999, 0.78, 1, "active"),
    ("EL-1002", "Wireless Earbuds Pro", "Consumer Electronics", 3499, 0.55, 2, "active"),
    ("EL-1003", "Smartphone 5G 128GB", "Consumer Electronics", 21999, 0.82, 1, "active"),
    ("EL-1004", 'Laptop 14" i5', "Consumer Electronics", 54999, 0.84, 1, "active"),
    ("AP-2001", "Inverter AC 1.5 Ton", "Home Appliances", 38999, 0.76, 1, "active"),
    ("AP-2002", "Front Load Washer 7kg", "Home Appliances", 29999, 0.77, 1, "active"),
    ("AP-2003", "Microwave Oven 25L", "Home Appliances", 8999, 0.72, 1, "active"),
    ("AP-2004", "Air Fryer 4L", "Home Appliances", 5499, 0.60, 2, "active"),
    ("FA-3001", "Cotton Kurta Set", "Fashion & Textiles", 1499, 0.45, 4, "active"),
    ("FA-3002", "Denim Jeans", "Fashion & Textiles", 1999, 0.50, 3, "active"),
    ("FA-3003", "Silk Saree", "Fashion & Textiles", 6499, 0.62, 1, "active"),
    ("FA-3004", "Running Shoes", "Fashion & Textiles", 2999, 0.55, 2, "active"),
    ("GR-4001", "Basmati Rice 5kg", "Grocery & FMCG", 649, 0.82, 5, "active"),
    ("GR-4002", "Filter Coffee 500g", "Grocery & FMCG", 449, 0.65, 4, "active"),
    ("GR-4003", "Cold-pressed Oil 1L", "Grocery & FMCG", 329, 0.78, 6, "active"),
    ("GR-4004", "Mixed Dry Fruits 1kg", "Grocery & FMCG", 899, 0.70, 3, "active"),
    ("OT-5001", "Ergonomic Office Chair", "Office & Lifestyle", 7499, 0.66, 2, "active"),
    ("OT-5002", "Stationery Bundle", "Office & Lifestyle", 599, 0.52, 5, "active"),
    ("OT-5003", "Yoga Mat", "Office & Lifestyle", 999, 0.50, 3, "active"),
    ("OT-5004", "Legacy Router X1", "Office & Lifestyle", 1799, 0.70, 2, "discontinued"),
]
FIRST = ["Aarav", "Diya", "Karthik", "Meera", "Rohan", "Ananya", "Vikram", "Priya", "Sanjay", "Lakshmi",
         "Arjun", "Kavya", "Nikhil", "Divya", "Suresh", "Anjali", "Rahul", "Pooja", "Manoj", "Swathi"]
LAST = ["Nair", "Iyer", "Reddy", "Menon", "Pillai", "Sharma", "Gupta", "Kumar", "Das", "Rao",
        "Patel", "Singh", "Joshi", "Naidu", "Varma", "Bose", "Mehta", "Shetty", "Kapoor", "Chandran"]


@dataclass
class PlannedOrder:
    number: str
    customer_email: str
    order_date: datetime
    status: str
    items: list[tuple[str, int, float, float]]  # sku, qty, unit_price, unit_cost

    @property
    def total(self) -> float:
        return sum(q * p for _, q, p, _ in self.items)


@dataclass
class Plan:
    customers: list[tuple[str, str, datetime, str]] = field(default_factory=list)  # name, email, registered_at, status
    orders: list[PlannedOrder] = field(default_factory=list)


def _status(rng: random.Random, age_days: int) -> str:
    names = [s.value for s in OrderStatus]  # pending, confirmed, shipped, delivered, cancelled, returned
    if age_days <= 1:
        weights = [10, 25, 30, 25, 6, 4]
    elif age_days <= 7:
        weights = [3, 5, 12, 72, 5, 3]
    else:
        weights = [0, 0, 0, 88, 7, 5]
    return rng.choices(names, weights)[0]


def build_plan(anchor: datetime) -> Plan:
    """Deterministic in-memory dataset; insertion later skips whatever already exists."""
    rng = random.Random(RNG_SEED)
    plan = Plan()
    for i in range(1, 401):
        registered = anchor - timedelta(days=rng.randint(30, 400), seconds=rng.randint(0, 86399))
        if i == 400:
            registered = anchor - timedelta(hours=5)  # newest customer -> recent activity
        status = CustomerStatus.ACTIVE.value if rng.random() < 0.92 else CustomerStatus.INACTIVE.value
        plan.customers.append((f"{FIRST[(i - 1) % 20]} {LAST[((i - 1) // 20) % 20]}", f"customer{i:03d}@example.com", registered, status))

    cat_names, cat_weights = [c for c, _ in CATEGORIES], [w for _, w in CATEGORIES]
    by_cat = {c: [p for p in PRODUCTS if p[2] == c and p[6] == ProductStatus.ACTIVE.value] for c in cat_names}

    n = 1000
    for offset in range(DAYS - 1, -1, -1):
        growth = 0.85 + 0.30 * ((DAYS - 1 - offset) / (DAYS - 1))  # order volume trends upward
        for _ in range(round(rng.randint(38, 52) * growth)):
            n += 1
            when = anchor - timedelta(days=offset, seconds=rng.randint(0, 86399))
            if when > anchor:
                when = anchor - timedelta(seconds=rng.randint(60, 3600))
            items: dict[str, tuple[str, int, float, float]] = {}
            for _ in range(rng.choices([1, 2, 3], [55, 30, 15])[0]):
                sku, _n, _c, price, ratio, max_qty, _s = rng.choice(by_cat[rng.choices(cat_names, cat_weights)[0]])
                items.setdefault(sku, (sku, rng.randint(1, max_qty), float(price), round(price * ratio, 2)))
            plan.orders.append(PlannedOrder(f"ORD{n}", plan.customers[rng.randrange(400)][1], when,
                                            _status(rng, offset), list(items.values())))
    return plan


def seed_database(db: Session, anchor: datetime | None = None) -> dict[str, int]:
    """Insert missing records only. Returns how many rows were inserted per table."""
    anchor = anchor or utc_now()
    plan = build_plan(anchor)
    inserted: dict[str, int] = {}

    def existing(column) -> set:
        return set(db.scalars(select(column)))

    # categories & products
    have = existing(Category.name)
    new = [Category(name=n) for n, _ in CATEGORIES if n not in have]
    db.add_all(new); db.flush(); inserted["categories"] = len(new)
    cat_id = dict(db.execute(select(Category.name, Category.id)).all())

    have = existing(Product.sku)
    new = [Product(sku=s, name=nm, category_id=cat_id[c], unit_price=p, unit_cost=round(p * r, 2), status=st)
           for s, nm, c, p, r, _q, st in PRODUCTS if s not in have]
    db.add_all(new); db.flush(); inserted["products"] = len(new)
    prod_id = dict(db.execute(select(Product.sku, Product.id)).all())

    # customers
    have = existing(Customer.email)
    new = [Customer(name=nm, email=em, registered_at=reg, status=st) for nm, em, reg, st in plan.customers if em not in have]
    db.add_all(new); db.flush(); inserted["customers"] = len(new)
    cust_id = dict(db.execute(select(Customer.email, Customer.id)).all())

    # orders (+ items, created together so an order is never half-inserted)
    have = existing(Order.order_number)
    new_orders = [
        Order(order_number=o.number, customer_id=cust_id[o.customer_email], order_date=o.order_date, status=o.status,
              items=[OrderItem(product_id=prod_id[sku], quantity=q, unit_price=price, unit_cost=cost) for sku, q, price, cost in o.items])
        for o in plan.orders if o.number not in have
    ]
    db.add_all(new_orders); db.flush(); inserted["orders"] = len(new_orders)
    order_id = dict(db.execute(select(Order.order_number, Order.id)).all())

    # monthly sales target: last-30-day qualifying revenue / 0.87  ->  roughly 87% achieved
    last30 = sum(o.total for o in plan.orders if o.status in QUALIFYING_STATUS_VALUES and o.order_date >= anchor - timedelta(days=30))
    if "monthly" not in existing(SalesTarget.name):
        db.add(SalesTarget(name="monthly", amount=round(last30 / 0.87, -3))); inserted["sales_targets"] = 1
    else:
        inserted["sales_targets"] = 0
    db.flush()
    target_id = db.scalar(select(SalesTarget.id).where(SalesTarget.name == "monthly"))

    # user + alerts
    inserted["users"] = 0
    if "Arjun Nair" not in existing(User.name):
        db.add(User(name="Arjun Nair", role="Regional Sales Head")); inserted["users"] = 1
    alerts = [("Low stock: SKU EL-2291", False, timedelta(hours=27)), ("North region target updated", False, timedelta(hours=2)),
              ("Refund spike detected", False, timedelta(hours=9)), ("Weekly report ready", True, timedelta(days=2))]
    have = existing(Alert.message)
    new = [Alert(message=m, is_read=r, created_at=anchor - age) for m, r, age in alerts if m not in have]
    db.add_all(new); inserted["alerts"] = len(new)

    # activities, derived from real rows: (type, reference, text, time)
    qualifying = [o for o in plan.orders if o.status != OrderStatus.CANCELLED.value]
    latest = max(qualifying, key=lambda o: o.order_date)
    window = [o for o in qualifying if anchor - timedelta(days=2) <= o.order_date < anchor - timedelta(days=1)]
    biggest = max(window or qualifying, key=lambda o: o.total)
    new_customer = plan.customers[-1]
    low_stock_sku = "EL-1003"
    wanted = [
        (ActivityType.ORDER_PLACED, ReferenceType.ORDER, order_id[latest.number], f"Order #{latest.number}", latest.order_date),
        (ActivityType.TARGET_UPDATED, ReferenceType.TARGET, target_id, "North Region", anchor - timedelta(hours=2)),
        (ActivityType.CUSTOMER_REGISTERED, ReferenceType.CUSTOMER, cust_id[new_customer[1]], new_customer[0], new_customer[2]),
        (ActivityType.LOW_STOCK, ReferenceType.PRODUCT, prod_id[low_stock_sku], "SKU EL-1003 · Chennai warehouse", anchor - timedelta(hours=27)),
        (ActivityType.ORDER_PLACED, ReferenceType.ORDER, order_id[biggest.number], f"Order #{biggest.number}", biggest.order_date),
    ]
    have = set(db.execute(select(Activity.activity_type, Activity.reference_type, Activity.reference_id)).all())
    new = [Activity(activity_type=t.value, reference_type=rt.value, reference_id=rid, description=desc, occurred_at=when)
           for t, rt, rid, desc, when in wanted if (t.value, rt.value, rid) not in have]
    db.add_all(new); inserted["activities"] = len(new)

    db.commit()
    return inserted


def reset_business_data(db: Session) -> None:
    """Delete rows in foreign-key order (tables and migrations are left untouched)."""
    for model in (Activity, Alert, OrderItem, Order, Customer, Product, Category, SalesTarget, User):
        db.execute(delete(model))
    db.commit()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--reset", action="store_true", help="delete all business data first")
    parser.add_argument("--anchor", help="YYYY-MM-DD: end of the generated history (default: now)")
    args = parser.parse_args()
    anchor = datetime.combine(datetime.fromisoformat(args.anchor).date(), time(12), tzinfo=timezone.utc) if args.anchor else None
    with SessionLocal() as db:
        if args.reset:
            reset_business_data(db)
        result = seed_database(db, anchor)
    total = sum(result.values())
    print("Inserted:", ", ".join(f"{v} {k}" for k, v in result.items()))
    if total == 0:
        print("Database already up to date, nothing inserted.")


if __name__ == "__main__":
    main()
