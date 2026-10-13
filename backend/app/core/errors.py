"""Maps failures to safe HTTP responses. Details are logged server-side only; clients never see
connection strings, credentials, SQL or stack traces."""
import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import InterfaceError, OperationalError, SQLAlchemyError

logger = logging.getLogger("app.errors")


class InvalidDateRange(ValueError):
    """Raised for logically invalid date filters (start after end, range too long)."""


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(InvalidDateRange)
    async def invalid_range(_: Request, exc: InvalidDateRange) -> JSONResponse:
        return JSONResponse(status_code=422, content={"detail": str(exc)})

    @app.exception_handler(OperationalError)
    @app.exception_handler(InterfaceError)
    async def database_unavailable(request: Request, exc: SQLAlchemyError) -> JSONResponse:
        logger.error("Database unavailable on %s (%s)", request.url.path, type(exc).__name__)
        return JSONResponse(status_code=503, content={"detail": "The database is temporarily unavailable. Please try again shortly."})

    @app.exception_handler(SQLAlchemyError)
    async def query_failed(request: Request, exc: SQLAlchemyError) -> JSONResponse:
        # e.g. missing tables because `alembic upgrade head` has not been run
        logger.exception("Database query failed on %s", request.url.path)
        return JSONResponse(status_code=500, content={"detail": "A database error occurred."})
