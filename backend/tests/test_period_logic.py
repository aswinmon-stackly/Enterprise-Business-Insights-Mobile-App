"""Pure logic: no database."""
from datetime import date, datetime, timezone

import pytest

from app.core.errors import InvalidDateRange
from app.core.periods import AnalyticsPreset as P
from app.core.periods import ComparisonPeriod as C
from app.services.comparison import compare
from app.services.period_service import comparison_range, resolve_period
from app.utils.dates import local_range_to_utc, today_local

TODAY = date(2026, 10, 12)


@pytest.mark.parametrize("preset,start,end", [
    (P.TODAY, date(2026, 10, 12), date(2026, 10, 12)),
    (P.LAST_7_DAYS, date(2026, 10, 6), date(2026, 10, 12)),
    (P.LAST_30_DAYS, date(2026, 9, 13), date(2026, 10, 12)),
    (P.THIS_MONTH, date(2026, 10, 1), date(2026, 10, 12)),
    (None, date(2026, 10, 6), date(2026, 10, 12)),  # default = last 7 days
])
def test_presets(preset, start, end):
    r = resolve_period(preset, None, None, TODAY)
    assert (r.start, r.end) == (start, end)


def test_custom_range_and_implied_custom():
    r = resolve_period(None, date(2026, 9, 1), date(2026, 9, 30), TODAY)
    assert r.preset is P.CUSTOM and r.days == 30


def test_this_month_on_the_first_is_one_day():
    r = resolve_period(P.THIS_MONTH, None, None, date(2026, 3, 1))
    assert r.days == 1 and r.start == date(2026, 3, 1)


@pytest.mark.parametrize("args", [
    (P.CUSTOM, None, None),                                  # custom needs dates
    (P.CUSTOM, date(2026, 10, 1), None),
    (P.TODAY, date(2026, 10, 1), date(2026, 10, 2)),         # preset + dates conflict
    (None, date(2026, 10, 12), date(2026, 10, 1)),           # start after end
    (None, date(2024, 1, 1), date(2026, 1, 1)),              # longer than 366 days
    (None, date(1999, 1, 1), date(1999, 1, 5)),              # outside supported dates
])
def test_invalid_ranges(args):
    with pytest.raises(InvalidDateRange):
        resolve_period(*args, TODAY)


def test_previous_period_is_equally_long_and_adjacent():
    cur = resolve_period(P.LAST_7_DAYS, None, None, TODAY)
    assert comparison_range(cur, C.PREVIOUS_PERIOD) == (date(2026, 9, 29), date(2026, 10, 5))
    month = resolve_period(P.THIS_MONTH, None, None, TODAY)  # 12 days -> the 12 days before 1 Oct
    assert comparison_range(month, C.PREVIOUS_PERIOD) == (date(2026, 9, 19), date(2026, 9, 30))


def test_previous_year_and_none():
    cur = resolve_period(None, date(2024, 2, 29), date(2024, 3, 2), TODAY)
    assert comparison_range(cur, C.PREVIOUS_YEAR) == (date(2023, 2, 28), date(2023, 3, 2))
    assert comparison_range(cur, C.NONE) is None


def test_business_day_boundaries_in_utc():
    # 12 Oct in Asia/Kolkata (UTC+5:30) = 11 Oct 18:30 UTC (inclusive) .. 12 Oct 18:30 UTC (exclusive)
    lo, hi = local_range_to_utc(date(2026, 10, 12), date(2026, 10, 12))
    assert lo == datetime(2026, 10, 11, 18, 30, tzinfo=timezone.utc)
    assert hi == datetime(2026, 10, 12, 18, 30, tzinfo=timezone.utc)


def test_today_is_computed_in_the_business_zone():
    # 20:00 UTC on 11 Oct is already 12 Oct 01:30 in Kolkata
    assert today_local(datetime(2026, 10, 11, 20, 0, tzinfo=timezone.utc)) == date(2026, 10, 12)


def test_compare_up_down_flat():
    up = compare(120, 100)
    assert (up.change_pct, up.direction) == (20.0, "up")
    down = compare(50, 100)
    assert (down.change_pct, down.direction) == (-50.0, "down")
    assert compare(100, 100).direction == "flat"
    assert compare(100.04, 100).direction == "flat"  # rounds to 0.0


def test_compare_previous_zero_never_gives_infinity():
    new = compare(500, 0)
    assert new.change_pct is None and new.direction == "new" and new.previous == 0
    both = compare(0, 0)
    assert both.change_pct == 0.0 and both.direction == "flat"
    gone = compare(0, 200)
    assert gone.change_pct == -100.0 and gone.direction == "down"


def test_compare_without_comparison_and_negative_previous():
    none = compare(10, None)
    assert none.previous is None and none.change_pct is None and none.direction == "none"
    assert compare(-50, -100).change_pct == 50.0  # loss shrank: measured against |previous|
