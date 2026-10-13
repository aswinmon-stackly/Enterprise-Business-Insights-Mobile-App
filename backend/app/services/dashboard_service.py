from datetime import timedelta

from sqlalchemy.orm import Session

from app.core.business_rules import REPORTING_PERIOD_DAYS, TREND_DAYS
from app.models.enums import OrderStatus
from app.repositories import meta_repository as meta
from app.repositories import order_repository as orders
from app.schemas.dashboard import DashboardResponse
from app.services import activity_service, analytics_service
from app.utils.time import ensure_utc, utc_now

RECENT_ACTIVITY_LIMIT = 5


def _pct_change(current: float, previous: float) -> float:
    return round((current - previous) / previous * 100, 1) if previous else 0.0


def get_dashboard(db: Session) -> DashboardResponse:
    """Applies the rules documented in app/core/business_rules.py to rows aggregated by PostgreSQL."""
    as_of = ensure_utc(orders.latest_order_time(db) or utc_now())
    end = as_of + timedelta(seconds=1)
    cur_start = as_of - timedelta(days=REPORTING_PERIOD_DAYS)
    prev_start = as_of - timedelta(days=REPORTING_PERIOD_DAYS * 2)

    cur = orders.period_kpis(db, cur_start, end)
    prev = orders.period_kpis(db, prev_start, cur_start)

    counts = orders.status_counts(db, cur_start, end)
    breakdown = [{"status": s.value, "count": counts.get(s.value, 0)} for s in OrderStatus]  # every status, zero-filled
    total_orders = sum(b["count"] for b in breakdown)
    delivered = counts.get(OrderStatus.DELIVERED.value, 0)

    last_day = as_of.date()
    this_week = analytics_service.revenue_series(db, last_day - timedelta(days=TREND_DAYS - 1), last_day)  # chart points
    # Pill next to the chart: rolling 7x24h windows, so a partially elapsed "today" does not skew the comparison.
    week_cur = orders.period_kpis(db, as_of - timedelta(days=TREND_DAYS), end).revenue
    week_prev = orders.period_kpis(db, as_of - timedelta(days=TREND_DAYS * 2), as_of - timedelta(days=TREND_DAYS)).revenue

    categories = orders.category_revenue(db, cur_start, end)
    prev_categories = dict(orders.category_revenue(db, prev_start, cur_start))
    if categories:
        name, revenue = categories[0]
        top = {"name": name, "revenue": revenue, "share_pct": round(revenue / cur.revenue * 100, 1) if cur.revenue else 0,
               "change": _pct_change(revenue, prev_categories.get(name, 0.0))}
    else:
        top = {"name": "No sales yet", "revenue": 0, "share_pct": 0, "change": 0}

    target = meta.monthly_target(db)
    user = meta.current_user(db)

    raw = {
        "user": {"name": user.name if user else "Guest", "role": user.role if user else ""},
        "unread_notifications": meta.unread_alert_count(db),
        "kpis": {
            "revenue": {"value": cur.revenue, "change": _pct_change(cur.revenue, prev.revenue)},
            "orders": {"value": cur.orders, "change": _pct_change(cur.orders, prev.orders)},
            "customers": {"value": cur.customers, "change": _pct_change(cur.customers, prev.customers)},
            "profit": {"value": cur.profit, "change": _pct_change(cur.profit, prev.profit)},
        },
        "analytics": {
            "revenue_trend": [{"label": d.strftime("%a"), "value": v} for d, v in this_week],
            "revenue_trend_change": _pct_change(week_cur, week_prev),
            "orders_summary": {
                "total_orders": total_orders,
                "average_order_value": round(cur.revenue / cur.orders, 2) if cur.orders else 0,
                "fulfilment_rate": round(delivered / total_orders * 100, 1) if total_orders else 0,
                "target_achieved": round(cur.revenue / target * 100, 1) if target else 0,
                "status_breakdown": breakdown,
            },
            "top_category": top,
        },
        "recent_activities": activity_service.list_activities(db, RECENT_ACTIVITY_LIMIT, 0).items,
    }
    return DashboardResponse.model_validate(raw)
