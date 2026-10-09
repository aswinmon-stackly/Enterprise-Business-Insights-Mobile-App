import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.dashboard import DashboardResponse
from app.services.dashboard_service import get_dashboard

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Dashboard"])


@router.get(
    "/dashboard",
    response_model=DashboardResponse,
    summary="Dashboard data",
    description="KPIs (last 30 days vs previous 30), analytics preview and recent activity, aggregated from PostgreSQL.",
    responses={503: {"description": "Database unavailable"}},
)
def read_dashboard(db: Session = Depends(get_db)) -> DashboardResponse:
    try:
        return get_dashboard(db)
    except SQLAlchemyError as exc:
        logger.exception("Dashboard query failed")
        raise HTTPException(status_code=503, detail="Dashboard data is temporarily unavailable.") from exc
