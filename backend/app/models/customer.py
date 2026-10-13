from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import CustomerStatus, sql_in


class Customer(Base):
    __tablename__ = "customers"
    __table_args__ = (CheckConstraint(sql_in("status", CustomerStatus), name="status_valid"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    registered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(String(20), default=CustomerStatus.ACTIVE.value)

    orders: Mapped[list["Order"]] = relationship(back_populates="customer")  # noqa: F821
