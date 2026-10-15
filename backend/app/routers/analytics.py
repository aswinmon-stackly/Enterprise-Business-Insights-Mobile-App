# from datetime import date

# from fastapi import APIRouter, Depends, Query
# from sqlalchemy.orm import Session

# from app.db.session import get_db
# from app.schemas.analytics import RevenueTrendResponse
# from app.services import analytics_service

# router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


# @router.get(
#     "/revenue-trend",
#     response_model=RevenueTrendResponse,
#     summary="Daily revenue between two dates",
#     description="Qualifying-order revenue per day. Defaults to the last 7 days. Every day in the range is returned "
#                 "(0 when there were no sales), so an empty period has the same shape as a populated one.",
#     responses={422: {"description": "Invalid date or date range"}},
# )
# def revenue_trend(
#     start_date: date | None = Query(None, description="Inclusive, YYYY-MM-DD"),
#     end_date: date | None = Query(None, description="Inclusive, YYYY-MM-DD"),
#     db: Session = Depends(get_db),
# ) -> RevenueTrendResponse:
#     return analytics_service.get_revenue_trend(db, start_date, end_date)




from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db

from app.schemas.analytics import (
    AnalyticsOverviewResponse,
    RevenueTrendResponse,
)

from app.services import analytics_service
from app.services import analytics_overview_service


router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"],
)


@router.get(
    "/overview",
    response_model=AnalyticsOverviewResponse,
    summary="Get dynamic business analytics overview",
)
def analytics_overview(
    start_date: date | None = Query(
        None,
        description="Inclusive start date YYYY-MM-DD",
    ),
    end_date: date | None = Query(
        None,
        description="Inclusive end date YYYY-MM-DD",
    ),
    db: Session = Depends(get_db),
):
    return analytics_overview_service.get_analytics_overview(
        db=db,
        start_date=start_date,
        end_date=end_date,
    )


@router.get(
    "/revenue-trend",
    response_model=RevenueTrendResponse,
    summary="Daily revenue between two dates",
)
def revenue_trend(
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    db: Session = Depends(get_db),
):
    return analytics_service.get_revenue_trend(
        db,
        start_date,
        end_date,
    )
