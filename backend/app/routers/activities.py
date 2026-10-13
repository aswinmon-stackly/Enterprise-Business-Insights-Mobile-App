from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.routers.deps import Pagination, pagination_params
from app.schemas.activity import RecentActivity
from app.schemas.common import Page
from app.services import activity_service

router = APIRouter(prefix="/api", tags=["Activities"])


@router.get("/activities", response_model=Page[RecentActivity], summary="Recent business activities (newest first)")
def list_activities(page: Pagination = Depends(pagination_params(10, 50)), db: Session = Depends(get_db)) -> Page[RecentActivity]:
    return activity_service.list_activities(db, page.limit, page.offset)
