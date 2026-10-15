"""GET /api/analytics/overview, checked against an independent in-Python calculation of the same raw rows."""
import json
from collections import defaultdict
from datetime import date, datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event, select
from sqlalchemy.orm import selectinload, sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401
from app.core.business_rules import QUALIFYING_STATUS_VALUES
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models import Category, Customer, Order, OrderItem, Product
from app.routers.deps import get_today
from app.utils.dates import BUSINESS_TZ
from app.utils.time import ensure_utc

TODAY = date(2026, 10, 12)  # the seed ends at 2026-10-12 12:00 UTC (17:30 Kolkata)
STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled", "returned"]


@pytest.fixture(autouse=True)
def pinned_today():
    app.dependency_overrides[get_today] = lambda: TODAY
    yield
    app.dependency_overrides.pop(get_today, None)


@pytest.fixture(scope="module")
def rows(session_factory):
    with session_factory() as db:
        return db.scalars(select(Order).options(selectinload(Order.items).selectinload(OrderItem.product)
                                                .selectinload(Product.category))).all()


def local_day(dt: datetime) -> date:
    return ensure_utc(dt).astimezone(BUSINESS_TZ).date()


def expected(rows, start: date, end: date) -> dict:
    """Straightforward Python re-implementation of the rules, used only as a test oracle."""
    in_range = [o for o in rows if start <= local_day(o.order_date) <= end]
    qualifying = [o for o in in_range if o.status in QUALIFYING_STATUS_VALUES]
    daily, cats = defaultdict(float), defaultdict(lambda: {"revenue": 0.0, "orders": set(), "units": 0})
    revenue = profit = 0.0
    for o in qualifying:
        for i in o.items:
            line = float(i.quantity * i.unit_price)
            revenue += line
            profit += float(i.quantity * (i.unit_price - i.unit_cost))
            daily[local_day(o.order_date)] += line
            c = cats[i.product.category.name]
            c["revenue"] += line; c["orders"].add(o.id); c["units"] += i.quantity
    counts = {s: sum(1 for o in in_range if o.status == s) for s in STATUSES}
    top = min(cats.items(), key=lambda kv: (-kv[1]["revenue"], kv[0])) if cats else None
    return {"revenue": revenue, "profit": profit, "orders": len(qualifying),
            "customers": len({o.customer_id for o in qualifying}), "daily": daily, "counts": counts, "top": top,
            "placed": len(in_range)}


def overview(client, **params):
    res = client.get("/api/analytics/overview", params=params)
    assert res.status_code == 200, res.text
    return res.json()


@pytest.mark.parametrize("start,end", [
    (date(2026, 10, 6), date(2026, 10, 12)),
    (date(2026, 9, 1), date(2026, 9, 30)),
    (date(2026, 10, 12), date(2026, 10, 12)),
    (date(2026, 8, 20), date(2026, 10, 12)),
])
def test_revenue_orders_profit_customers_match_oracle(client, rows, start, end):
    body, exp = overview(client, period="custom", start_date=start.isoformat(), end_date=end.isoformat()), expected(rows, start, end)
    m = body["metrics"]
    assert m["revenue"]["value"] == pytest.approx(exp["revenue"], rel=1e-9)
    assert m["profit"]["value"] == pytest.approx(exp["profit"], rel=1e-9)
    assert m["orders"]["value"] == exp["orders"]
    assert m["customers"]["value"] == exp["customers"]
    assert 0 < m["profit"]["value"] < m["revenue"]["value"]
    assert body["period"]["days"] == (end - start).days + 1
    assert body["period"]["timezone"] == BUSINESS_TZ.key


def test_revenue_trend_is_zero_filled_and_sums_to_total(client, rows):
    start, end = date(2026, 10, 1), date(2026, 10, 12)
    body, exp = overview(client, period="custom", start_date=start.isoformat(), end_date=end.isoformat()), expected(rows, start, end)
    points = body["revenueTrend"]
    assert [p["date"] for p in points] == [(start + timedelta(days=i)).isoformat() for i in range(12)]
    for p in points:
        assert p["revenue"] == pytest.approx(exp["daily"].get(date.fromisoformat(p["date"]), 0.0), rel=1e-9)
    assert sum(p["revenue"] for p in points) == pytest.approx(body["metrics"]["revenue"]["value"], rel=1e-9)
    best = body["performance"]["bestDay"]
    assert best["revenue"] == pytest.approx(max(p["revenue"] for p in points))


def test_period_with_no_sales(client):
    body = overview(client, period="custom", start_date="2020-01-01", end_date="2020-01-07")
    assert body["isEmpty"] is True and body["topCategory"] is None
    assert body["metrics"]["revenue"]["value"] == 0 and body["metrics"]["orders"]["value"] == 0
    assert [p["revenue"] for p in body["revenueTrend"]] == [0] * 7
    assert [s["count"] for s in body["orderStatusBreakdown"]] == [0] * 6
    assert all(s["sharePct"] == 0 for s in body["orderStatusBreakdown"])
    assert body["performance"]["bestDay"] is None and body["performance"]["averageOrderValue"] == 0
    assert body["metrics"]["revenue"]["direction"] == "flat"  # 0 vs 0


def test_previous_period_comparison_matches_oracle(client, rows):
    start, end = date(2026, 10, 6), date(2026, 10, 12)
    body = overview(client, period="custom", start_date=start.isoformat(), end_date=end.isoformat())
    assert body["comparison"] == {"type": "previous_period", "startDate": "2026-09-29", "endDate": "2026-10-05"}
    cur, prev = expected(rows, start, end), expected(rows, date(2026, 9, 29), date(2026, 10, 5))
    for key in ("revenue", "orders", "profit"):
        m = body["metrics"][key]
        assert m["previous"] == pytest.approx(prev[key], rel=1e-9)
        assert m["changePct"] == pytest.approx(round((cur[key] - prev[key]) / prev[key] * 100, 1), abs=0.05)
        assert m["direction"] == ("up" if cur[key] > prev[key] else "down")


def test_previous_period_value_of_zero(client):
    # the data starts on 13 Aug (Kolkata), so 11-12 Aug has nothing
    res = client.get("/api/analytics/overview", params={"period": "custom", "start_date": "2026-08-13", "end_date": "2026-08-14"})
    body = res.json()
    assert body["comparison"]["startDate"] == "2026-08-11"
    for key in ("revenue", "orders", "profit", "customers"):
        m = body["metrics"][key]
        assert m["previous"] == 0 and m["value"] > 0
        assert m["changePct"] is None and m["direction"] == "new"
    assert "Infinity" not in res.text and "NaN" not in res.text


def test_comparison_none_and_previous_year(client):
    none = overview(client, period="last_7_days", comparison_period="none")
    assert none["comparison"] is None
    assert all(none["metrics"][k]["direction"] == "none" and none["metrics"][k]["previous"] is None for k in none["metrics"])
    year = overview(client, period="custom", start_date="2026-10-06", end_date="2026-10-12", comparison_period="previous_year")
    assert year["comparison"] == {"type": "previous_year", "startDate": "2025-10-06", "endDate": "2025-10-12"}
    assert year["metrics"]["revenue"]["direction"] == "new"


def test_top_category_selection(client, rows):
    start, end = date(2026, 9, 13), date(2026, 10, 12)
    body, exp = overview(client, period="last_30_days"), expected(rows, start, end)
    name, c = exp["top"]
    top = body["topCategory"]
    assert top["name"] == name
    assert top["revenue"] == pytest.approx(c["revenue"], rel=1e-9)
    assert top["orders"] == len(c["orders"]) and top["unitsSold"] == c["units"]
    assert top["sharePct"] == pytest.approx(round(c["revenue"] / exp["revenue"] * 100, 1), abs=0.05)


def test_order_status_breakdown_and_cancelled_exclusion(client, rows):
    start, end = date(2026, 9, 13), date(2026, 10, 12)
    body, exp = overview(client, period="last_30_days"), expected(rows, start, end)
    got = {s["status"]: s["count"] for s in body["orderStatusBreakdown"]}
    assert got == exp["counts"] and sum(got.values()) == exp["placed"]
    assert [s["status"] for s in body["orderStatusBreakdown"]] == STATUSES
    assert got["cancelled"] > 0 and got["returned"] > 0
    # financial metrics only count confirmed + shipped + delivered
    assert body["metrics"]["orders"]["value"] == got["confirmed"] + got["shipped"] + got["delivered"]
    assert sum(s["sharePct"] for s in body["orderStatusBreakdown"]) == pytest.approx(100, abs=0.5)
    perf = body["performance"]
    assert perf["completionRatePct"] == pytest.approx(round(got["delivered"] / exp["placed"] * 100, 1), abs=0.05)
    assert perf["cancellationRatePct"] == pytest.approx(round(got["cancelled"] / exp["placed"] * 100, 1), abs=0.05)


def test_presets_use_the_business_date(client):
    expectations = {"today": ("2026-10-12", "2026-10-12"), "last_7_days": ("2026-10-06", "2026-10-12"),
                    "last_30_days": ("2026-09-13", "2026-10-12"), "this_month": ("2026-10-01", "2026-10-12")}
    for preset, (start, end) in expectations.items():
        p = overview(client, period=preset)["period"]
        assert (p["preset"], p["startDate"], p["endDate"]) == (preset, start, end)
    assert overview(client)["period"]["preset"] == "last_7_days"  # default


@pytest.mark.parametrize("params", [
    {"period": "custom"},
    {"period": "custom", "start_date": "2026-10-12", "end_date": "2026-10-01"},
    {"period": "custom", "start_date": "2024-01-01", "end_date": "2026-01-01"},
    {"period": "today", "start_date": "2026-10-01", "end_date": "2026-10-02"},
    {"period": "custom", "start_date": "not-a-date", "end_date": "2026-10-02"},
    {"period": "custom", "start_date": "2026-02-30", "end_date": "2026-03-02"},
    {"period": "yesterday"},
    {"comparison_period": "last_decade"},
])
def test_invalid_requests_are_rejected(client, params):
    res = client.get("/api/analytics/overview", params=params)
    assert res.status_code == 422, params
    assert "Traceback" not in res.text


def test_start_after_end_message_is_clear(client):
    res = client.get("/api/analytics/overview", params={"start_date": "2026-10-12", "end_date": "2026-10-01"})
    assert "start_date must be on or before end_date" in res.json()["detail"]


def test_response_contains_only_finite_numbers(client):
    for params in ({"period": "today"}, {"period": "last_30_days"}, {"start_date": "2020-01-01", "end_date": "2020-01-02"}):
        text = client.get("/api/analytics/overview", params=params).text
        json.loads(text, parse_constant=lambda c: pytest.fail(f"non-finite number {c}"))


def test_query_count_is_constant(client, session_factory):
    engine = session_factory.kw["bind"]
    seen = []
    listener = lambda conn, cur, stmt, *a: seen.append(stmt)  # noqa: E731
    event.listen(engine, "before_cursor_execute", listener)
    try:
        for params in ({"period": "today"}, {"period": "last_30_days"}, {"period": "last_30_days", "comparison_period": "none"}):
            seen.clear()
            assert client.get("/api/analytics/overview", params=params).status_code == 200
            assert len(seen) == 4, (params, len(seen))
    finally:
        event.remove(engine, "before_cursor_execute", listener)


def test_midnight_boundary_uses_the_business_time_zone():
    """23:59:59 and 00:00:00 Kolkata fall on different business days (own small SQLite database)."""
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine, expire_on_commit=False)
    with Session() as db:
        cat = Category(name="Cat"); db.add(cat); db.flush()
        prod = Product(sku="P1", name="P", category_id=cat.id, unit_price=100, unit_cost=60); db.add(prod)
        cust = Customer(name="C", email="c@example.com", registered_at=datetime(2026, 1, 1, tzinfo=timezone.utc)); db.add(cust); db.flush()
        for number, when, price in (("A", datetime(2026, 10, 11, 18, 29, 59, tzinfo=timezone.utc), 100),   # 11 Oct 23:59:59 IST
                                    ("B", datetime(2026, 10, 11, 18, 30, 0, tzinfo=timezone.utc), 300)):   # 12 Oct 00:00:00 IST
            db.add(Order(order_number=number, customer_id=cust.id, order_date=when, status="delivered",
                         items=[OrderItem(product_id=prod.id, quantity=1, unit_price=price, unit_cost=60)]))
        db.commit()

    def override():
        with Session() as db:
            yield db

    previous = app.dependency_overrides.get(get_db)
    app.dependency_overrides[get_db] = override
    try:
        c = TestClient(app)
        def day(d):
            return c.get("/api/analytics/overview", params={"period": "custom", "start_date": d, "end_date": d, "comparison_period": "none"}).json()
        eleventh, twelfth = day("2026-10-11"), day("2026-10-12")
        assert eleventh["metrics"]["revenue"]["value"] == 100 and twelfth["metrics"]["revenue"]["value"] == 300
        assert twelfth["revenueTrend"] == [{"date": "2026-10-12", "revenue": 300.0}]
    finally:
        app.dependency_overrides[get_db] = previous
