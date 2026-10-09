"""Importing this package registers every table on Base.metadata."""
from app.models.business import Category, Customer, Order, SalesTarget
from app.models.system import Activity, Alert, User

__all__ = ["Activity", "Alert", "Category", "Customer", "Order", "SalesTarget", "User"]
