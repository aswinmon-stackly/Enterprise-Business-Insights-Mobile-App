from datetime import datetime, time, timedelta, timezone

from sqlalchemy.orm import Session

from app.repositories import dashboard_repository as repo
from app.schemas.dashboard import DashboardResponse
from app.utils.time import utc_now

PERIOD_DAYS = 30


def _pct_change(current: float, previous: float) -> float:
    return round((current - previous) / previous * 100, 1) if previous else 0.0


def _aware(dt: datetime) -> datetime:
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def get_dashboard(db: Session) -> DashboardResponse:
    """Business rules: periods, % change, fulfilment rate, target progress.

    Anchored on the latest order so the demo dataset always fills the window,
    even if it was seeded days ago.
    """
    as_of = _aware(repo.latest_order_time(db) or utc_now())
    end = as_of + timedelta(seconds=1)
    cur_start = as_of - timedelta(days=PERIOD_DAYS)
    prev_start = as_of - timedelta(days=PERIOD_DAYS * 2)

    cur = repo.period_totals(db, cur_start, end)
    prev = repo.period_totals(db, prev_start, cur_start)

    # last 7 calendar days, zero-filled
    first_day = (as_of - timedelta(days=6)).date()
    daily = repo.daily_revenue(db, datetime.combine(first_day, time.min, tzinfo=timezone.utc), end)
    trend = []
    for i in range(7):
        d = first_day + timedelta(days=i)
        trend.append({"label": d.strftime("%a"), "value": daily.get(d, 0.0)})

    cats_cur = repo.category_revenue(db, cur_start, end)
    cats_prev = dict(repo.category_revenue(db, prev_start, cur_start))
    if cats_cur:
        name, rev = cats_cur[0]
        top = {"name": name, "revenue": rev, "share_pct": round(rev / cur.revenue * 100, 1) if cur.revenue else 0,
               "change": _pct_change(rev, cats_prev.get(name, 0.0))}
    else:
        top = {"name": "No data", "revenue": 0, "share_pct": 0, "change": 0}

    target = repo.monthly_target(db)
    user = repo.current_user(db)

    raw = {
        "user": {"name": user.name if user else "Guest", "role": user.role if user else ""},
        "unread_notifications": repo.unread_alert_count(db),
        "kpis": {
            "revenue": {"value": cur.revenue, "change": _pct_change(cur.revenue, prev.revenue)},
            "orders": {"value": cur.orders, "change": _pct_change(cur.orders, prev.orders)},
            "customers": {"value": cur.customers, "change": _pct_change(cur.customers, prev.customers)},
            "profit": {"value": cur.profit, "change": _pct_change(cur.profit, prev.profit)},
        },
        "analytics": {
            "revenue_trend": trend,
            "orders_summary": {
                "total_orders": cur.orders,
                "average_order_value": round(cur.revenue / cur.orders, 2) if cur.orders else 0,
                "fulfilment_rate": round(cur.delivered / cur.orders * 100, 1) if cur.orders else 0,
                "target_achieved": round(cur.revenue / target * 100, 1) if target else 0,
            },
            "top_category": top,
        },
        "recent_activities": [
            {"id": f"act-{a.id}", "type": a.type, "title": a.title, "subtitle": a.subtitle,
             "amount": float(a.amount) if a.amount is not None else None, "timestamp": _aware(a.created_at)}
            for a in repo.recent_activities(db)
        ],
    }
    return DashboardResponse.model_validate(raw)
