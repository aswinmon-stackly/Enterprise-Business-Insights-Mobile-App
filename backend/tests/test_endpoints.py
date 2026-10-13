from sqlalchemy.exc import OperationalError
from fastapi.testclient import TestClient

from app.db.session import get_db
from app.main import app


def test_orders_pagination(client):
    first = client.get("/api/orders?limit=5&offset=0").json()
    second = client.get("/api/orders?limit=5&offset=5").json()
    assert first["limit"] == 5 and first["offset"] == 0 and len(first["items"]) == 5
    assert first["total"] > 1000
    assert {o["id"] for o in first["items"]}.isdisjoint({o["id"] for o in second["items"]})
    dates = [o["orderDate"] for o in first["items"]]
    assert dates == sorted(dates, reverse=True)
    assert first["items"][0]["totalAmount"] > 0 and first["items"][0]["customerName"]


def test_orders_status_filter_and_empty_page(client):
    cancelled = client.get("/api/orders?status=cancelled&limit=100").json()
    assert cancelled["total"] > 0 and all(o["status"] == "cancelled" for o in cancelled["items"])
    beyond = client.get(f"/api/orders?offset={cancelled['total'] + 1000}&status=cancelled").json()
    assert beyond["items"] == [] and beyond["total"] == cancelled["total"]


def test_pagination_validation(client):
    for query in ("limit=0", "limit=101", "offset=-1", "limit=abc", "status=nope"):
        assert client.get(f"/api/orders?{query}").status_code == 422, query
    assert client.get("/api/activities?limit=51").status_code == 422


def test_customers(client):
    page = client.get("/api/customers?limit=3").json()
    assert len(page["items"]) == 3 and page["total"] == 400
    assert set(page["items"][0]) == {"id", "name", "email", "status", "registeredAt"}
    inactive = client.get("/api/customers?status=inactive&limit=100").json()
    assert 0 < inactive["total"] < 400


def test_activities_newest_first(client):
    page = client.get("/api/activities?limit=10").json()
    stamps = [a["timestamp"] for a in page["items"]]
    assert page["total"] == 5 and stamps == sorted(stamps, reverse=True)
    orders = [a for a in page["items"] if a["type"] == "order"]
    assert orders and all(a["amount"] and a["amount"] > 0 for a in orders)


def test_revenue_trend_filters_in_range(client):
    body = client.get("/api/analytics/revenue-trend?start_date=2026-10-01&end_date=2026-10-12").json()
    assert body["startDate"] == "2026-10-01" and body["endDate"] == "2026-10-12" and body["interval"] == "day"
    assert [p["date"] for p in body["points"]][0] == "2026-10-01" and len(body["points"]) == 12
    assert body["totalRevenue"] == round(sum(p["revenue"] for p in body["points"]), 2) > 0


def test_revenue_trend_default_is_last_7_days(client):
    assert len(client.get("/api/analytics/revenue-trend").json()["points"]) == 7


def test_revenue_trend_empty_period_has_same_shape(client):
    body = client.get("/api/analytics/revenue-trend?start_date=2020-01-01&end_date=2020-01-03").json()
    assert body["totalRevenue"] == 0 and [p["revenue"] for p in body["points"]] == [0, 0, 0]
    assert set(body) == {"startDate", "endDate", "interval", "totalRevenue", "points"}


def test_revenue_trend_rejects_bad_input(client):
    assert client.get("/api/analytics/revenue-trend?start_date=2026-10-12&end_date=2026-10-01").status_code == 422
    assert client.get("/api/analytics/revenue-trend?start_date=not-a-date").status_code == 422
    assert client.get("/api/analytics/revenue-trend?start_date=2024-01-01&end_date=2026-01-01").status_code == 422
    assert "start_date" in client.get("/api/analytics/revenue-trend?start_date=2026-10-12&end_date=2026-10-01").json()["detail"]


def test_database_down_returns_safe_503(session_factory):
    def broken():
        raise OperationalError("SELECT 1", {}, Exception("password=hunter2 host=10.0.0.5"))
        yield  # pragma: no cover

    previous = app.dependency_overrides.get(get_db)
    app.dependency_overrides[get_db] = broken
    try:
        for path in ("/api/dashboard", "/api/orders", "/health/db"):
            res = TestClient(app, raise_server_exceptions=False).get(path)
            assert res.status_code == 503, path
            assert "hunter2" not in res.text and "10.0.0.5" not in res.text and "Traceback" not in res.text
    finally:
        app.dependency_overrides[get_db] = previous


def test_health(client):
    assert client.get("/health").json() == {"status": "ok"}
