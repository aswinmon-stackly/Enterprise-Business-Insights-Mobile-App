from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

_is_postgres = settings.database_url.startswith("postgresql")
# UTC session + fast failure when the server is down (the mobile client times out after 10 s).
_connect_args = {"options": "-c timezone=utc", "connect_timeout": 5} if _is_postgres else {}

engine = create_engine(settings.database_url, pool_pre_ping=True, connect_args=_connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db() -> Iterator[Session]:
    """FastAPI dependency: one session per request, always closed (connection returns to the pool)."""
    with SessionLocal() as db:
        yield db
