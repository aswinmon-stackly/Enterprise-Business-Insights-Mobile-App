"""Tests never touch your dev database: DATABASE_URL is forced to TEST_DATABASE_URL (default: in-memory SQLite).
To run against PostgreSQL:  TEST_DATABASE_URL=postgresql+psycopg://USER:PASSWORD@localhost:5432/business_insights_test pytest
(use a dedicated, empty database: tables are created and dropped by the tests)."""
import os
from datetime import datetime, timezone

TEST_URL = os.environ.get("TEST_DATABASE_URL", "sqlite://")
os.environ["DATABASE_URL"] = TEST_URL  # must happen before importing the app

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

import app.models  # noqa: E402,F401
from app.core.config import settings  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.db.session import get_db  # noqa: E402
from app.main import app  # noqa: E402
from scripts.seed_data import seed_database  # noqa: E402

ANCHOR = datetime(2026, 10, 12, 12, 0, tzinfo=timezone.utc)


@pytest.fixture(scope="session")
def session_factory():
    url = settings.database_url
    kwargs = {"connect_args": {"check_same_thread": False}, "poolclass": StaticPool} if url.startswith("sqlite") else {}
    engine = create_engine(url, **kwargs)
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine, expire_on_commit=False)
    with factory() as db:
        seed_database(db, ANCHOR)
    yield factory
    Base.metadata.drop_all(engine)


@pytest.fixture(scope="session")
def client(session_factory):
    def override():
        with session_factory() as db:
            yield db

    app.dependency_overrides[get_db] = override
    yield TestClient(app)
    app.dependency_overrides.clear()
