from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.enums import ActivityType, ReferenceType, sql_in


class Activity(Base):
    """Business event feed. reference_type + reference_id point at the related row (polymorphic, so no FK)."""

    __tablename__ = "activities"
    __table_args__ = (
        CheckConstraint(sql_in("activity_type", ActivityType), name="activity_type_valid"),
        CheckConstraint("(reference_type IS NULL) = (reference_id IS NULL)", name="reference_pair"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    activity_type: Mapped[str] = mapped_column(String(40))
    description: Mapped[str] = mapped_column(String(255))
    reference_type: Mapped[str | None] = mapped_column(String(20), nullable=True)
    reference_id: Mapped[int | None] = mapped_column(nullable=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
