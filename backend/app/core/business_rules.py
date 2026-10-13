"""Business definitions used by the KPI queries. Change them here, documented in one place.

Reporting period
    Rolling 30 days ending at the most recent order in the database ("as of"), compared with the 30 days before.
    (Anchoring on the latest order keeps demo/historical data meaningful; swap for utc_now() on live data.)

Qualifying order
    status IN (confirmed, shipped, delivered). Excluded: pending (not yet confirmed), cancelled, returned.

Revenue  = SUM(quantity * unit_price)                   over qualifying order items
Profit   = SUM(quantity * (unit_price - unit_cost))     i.e. revenue minus cost of goods sold
Orders   = COUNT(DISTINCT order)                        qualifying orders
Customers= COUNT(DISTINCT customer)                     customers with >= 1 qualifying order ("active customers")
Order summary = ALL orders placed in the period grouped by status (every status, zero-filled)
Fulfilment rate = delivered orders / all orders placed in the period
Top category    = category with the highest revenue in the period
Target achieved = period revenue / monthly sales target
unit_price and unit_cost are copied onto the order item at sale time, so later price changes never rewrite history.
"""
from app.models.enums import OrderStatus

REPORTING_PERIOD_DAYS = 30
TREND_DAYS = 7
MAX_TREND_RANGE_DAYS = 366

QUALIFYING_ORDER_STATUSES = (OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.DELIVERED)
QUALIFYING_STATUS_VALUES = [s.value for s in QUALIFYING_ORDER_STATUSES]
