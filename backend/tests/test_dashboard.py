"""Runs against an in-memory SQLite DB so tests need no PostgreSQL server."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401
from app.db.base import Base
from app.db.seed import seed_database
from app.db.session import get_db
from app.main import app

engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestSession = sessionmaker(bind=engine, expire_on_commit=False)


@pytest.fixture(scope="module")
def client():
    Base.metadata.create_all(engine)
    with TestSession() as db:
        seed_database(db)

    def override():
        with TestSession() as db:
            yield db

    app.dependency_overrides[get_db] = override
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_dashboard_shape_and_values(client):
    res = client.get("/api/dashboard")
    assert res.status_code == 200
    body = res.json()
    assert set(body["kpis"]) == {"revenue", "orders", "customers", "profit"}
    assert body["kpis"]["revenue"]["value"] > body["kpis"]["profit"]["value"] > 0
    assert len(body["analytics"]["revenueTrend"]) == 7
    assert 80 <= body["analytics"]["ordersSummary"]["targetAchieved"] <= 95
    assert body["unreadNotifications"] == 3
    assert len(body["recentActivities"]) == 5
    assert body["recentActivities"][0]["timestamp"].endswith(("Z", "+00:00"))


def test_openapi_exposes_dashboard_endpoint(client):
    assert "/api/dashboard" in client.get("/openapi.json").json()["paths"]


def test_health(client):
    assert client.get("/health").json() == {"status": "ok"}
