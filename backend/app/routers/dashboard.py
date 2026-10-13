from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.dashboard import DashboardResponse
from app.services.dashboard_service import get_dashboard

router = APIRouter(prefix="/api", tags=["Dashboard"])


@router.get(
    "/dashboard",
    response_model=DashboardResponse,
    summary="Dashboard data",
    description="KPIs for the last 30 days vs the previous 30, analytics preview and recent activity, all aggregated "
                "from PostgreSQL. Rules: see app/core/business_rules.py.",
    responses={503: {"description": "Database unavailable"}, 500: {"description": "Database error"}},
)
def read_dashboard(db: Session = Depends(get_db)) -> DashboardResponse:
    return get_dashboard(db)
