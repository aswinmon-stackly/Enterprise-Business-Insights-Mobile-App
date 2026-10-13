from enum import Enum


class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    RETURNED = "returned"


class CustomerStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class ProductStatus(str, Enum):
    ACTIVE = "active"
    DISCONTINUED = "discontinued"


class ActivityType(str, Enum):
    ORDER_PLACED = "order_placed"
    TARGET_UPDATED = "target_updated"
    CUSTOMER_REGISTERED = "customer_registered"
    LOW_STOCK = "low_stock"


class ReferenceType(str, Enum):
    ORDER = "order"
    CUSTOMER = "customer"
    PRODUCT = "product"
    TARGET = "target"


def sql_in(column: str, enum_cls: type[Enum]) -> str:
    """CHECK constraint text, e.g. status IN ('pending', 'confirmed', ...)."""
    return f"{column} IN ({', '.join(repr(e.value) for e in enum_cls)})"
