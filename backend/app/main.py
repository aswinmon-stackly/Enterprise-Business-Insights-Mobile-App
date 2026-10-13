from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.errors import register_exception_handlers
from app.db.session import get_db
from app.routers import activities, analytics, customers, dashboard, orders

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Backend for the Enterprise Business Insights mobile app (FastAPI + PostgreSQL). "
                "Schema is managed with Alembic migrations.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=settings.cors_origin_regex,
    allow_methods=["GET"],
    allow_headers=["*"],
)
register_exception_handlers(app)

for module in (dashboard, orders, customers, analytics, activities):
    app.include_router(module.router)


@app.get("/health", tags=["Health"], summary="Liveness check")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health/db", tags=["Health"], summary="Database connectivity check (503 if unreachable)")
def health_db(db: Session = Depends(get_db)) -> dict[str, str]:
    db.execute(text("SELECT 1"))
    return {"status": "ok"}
