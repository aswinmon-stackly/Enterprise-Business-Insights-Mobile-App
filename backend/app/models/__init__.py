"""Importing this package registers every table on Base.metadata (needed by Alembic)."""
from app.models.activity import Activity
from app.models.catalog import Category, Product
from app.models.customer import Customer
from app.models.order import Order, OrderItem
from app.models.system import Alert, SalesTarget, User

__all__ = ["Activity", "Alert", "Category", "Customer", "Order", "OrderItem", "Product", "SalesTarget", "User"]
