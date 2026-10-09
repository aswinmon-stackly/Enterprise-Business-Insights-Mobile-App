from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

import app.models  # noqa: F401  (registers tables on Base.metadata)
from app.config import settings
from app.db.base import Base
from app.db.session import engine, get_db
from app.routers import dashboard


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(engine)  # dev convenience; swap for Alembic migrations in production
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Backend for the Enterprise Business Insights mobile app (FastAPI + PostgreSQL).",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=settings.cors_origin_regex,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(dashboard.router)


@app.get("/health", tags=["Health"], summary="Liveness check")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health/db", tags=["Health"], summary="Database connectivity check")
def health_db(db: Session = Depends(get_db)) -> dict[str, str]:
    try:
        db.execute(text("SELECT 1"))
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=503, detail="Database unavailable") from exc
    return {"status": "ok"}
