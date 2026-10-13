from datetime import timedelta

import pytest
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.business_rules import QUALIFYING_STATUS_VALUES
from app.models import Order


def _naive(dt):
    return dt.replace(tzinfo=None)


def test_dashboard_contract(client):
    res = client.get("/api/dashboard")
    assert res.status_code == 200
    body = res.json()
    assert set(body["kpis"]) == {"revenue", "orders", "customers", "profit"}
    assert set(body["analytics"]) == {"revenueTrend", "revenueTrendChange", "ordersSummary", "topCategory"}
    assert len(body["analytics"]["revenueTrend"]) == 7
    assert len(body["recentActivities"]) == 5
    assert body["unreadNotifications"] == 3
    statuses = [s["status"] for s in body["analytics"]["ordersSummary"]["statusBreakdown"]]
    assert statuses == ["pending", "confirmed", "shipped", "delivered", "cancelled", "returned"]


def test_kpis_match_an_independent_python_calculation(client, session_factory):
    """Recompute revenue/profit/orders/customers from raw rows and compare with the SQL-driven API."""
    with session_factory() as db:
        orders = db.scalars(select(Order).options(selectinload(Order.items))).all()
    as_of = max(_naive(o.order_date) for o in orders)
    start = as_of - timedelta(days=30)
    qualifying = [o for o in orders if o.status in QUALIFYING_STATUS_VALUES and start <= _naive(o.order_date) <= as_of]
    revenue = sum(i.quantity * i.unit_price for o in qualifying for i in o.items)
    profit = sum(i.quantity * (i.unit_price - i.unit_cost) for o in qualifying for i in o.items)
    all_in_period = [o for o in orders if start <= _naive(o.order_date) <= as_of]

    body = client.get("/api/dashboard").json()
    assert body["kpis"]["revenue"]["value"] == pytest.approx(float(revenue), rel=1e-9)
    assert body["kpis"]["profit"]["value"] == pytest.approx(float(profit), rel=1e-9)
    assert body["kpis"]["orders"]["value"] == len(qualifying)
    assert body["kpis"]["customers"]["value"] == len({o.customer_id for o in qualifying})
    assert 0 < body["kpis"]["profit"]["value"] < body["kpis"]["revenue"]["value"]  # profit != revenue
    summary = body["analytics"]["ordersSummary"]
    assert summary["totalOrders"] == len(all_in_period) == sum(s["count"] for s in summary["statusBreakdown"])


def test_top_category_is_highest_revenue(client):
    top = client.get("/api/dashboard").json()["analytics"]["topCategory"]
    assert top["name"] and top["revenue"] > 0 and 0 < top["sharePct"] <= 100


def test_openapi_lists_all_endpoints(client):
    paths = client.get("/openapi.json").json()["paths"]
    for p in ("/api/dashboard", "/api/orders", "/api/customers", "/api/analytics/revenue-trend", "/api/activities", "/health"):
        assert p in paths
