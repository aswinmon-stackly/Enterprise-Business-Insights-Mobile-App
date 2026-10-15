"""Pure date logic (no database): preset resolution, validation and the comparison range."""
from dataclasses import dataclass
from datetime import date, timedelta

from app.core.errors import InvalidDateRange
from app.core.periods import MAX_DATE, MAX_RANGE_DAYS, MIN_DATE, AnalyticsPreset, ComparisonPeriod


@dataclass(frozen=True)
class ResolvedPeriod:
    preset: AnalyticsPreset
    start: date
    end: date

    @property
    def days(self) -> int:
        return (self.end - self.start).days + 1


def resolve_period(preset: AnalyticsPreset | None, start_date: date | None, end_date: date | None, today: date) -> ResolvedPeriod:
    """`today` is the current date in the business time zone. Presets end today (inclusive).

    today        -> [today, today]
    last_7_days  -> [today-6, today]
    last_30_days -> [today-29, today]
    this_month   -> [first day of this month, today]   (month to date)
    custom       -> [start_date, end_date]
    """
    if start_date is not None or end_date is not None:
        if preset not in (None, AnalyticsPreset.CUSTOM):
            raise InvalidDateRange("start_date and end_date can only be combined with period=custom.")
        preset = AnalyticsPreset.CUSTOM
    preset = preset or AnalyticsPreset.LAST_7_DAYS

    if preset is AnalyticsPreset.CUSTOM:
        if start_date is None or end_date is None:
            raise InvalidDateRange("start_date and end_date are required for a custom range.")
        _validate(start_date, end_date)
        return ResolvedPeriod(preset, start_date, end_date)
    if preset is AnalyticsPreset.TODAY:
        return ResolvedPeriod(preset, today, today)
    if preset is AnalyticsPreset.LAST_7_DAYS:
        return ResolvedPeriod(preset, today - timedelta(days=6), today)
    if preset is AnalyticsPreset.LAST_30_DAYS:
        return ResolvedPeriod(preset, today - timedelta(days=29), today)
    return ResolvedPeriod(preset, today.replace(day=1), today)  # THIS_MONTH


def _validate(start: date, end: date) -> None:
    if start > end:
        raise InvalidDateRange("start_date must be on or before end_date.")
    if start < MIN_DATE or end > MAX_DATE:
        raise InvalidDateRange(f"Dates must be between {MIN_DATE} and {MAX_DATE}.")
    if (end - start).days + 1 > MAX_RANGE_DAYS:
        raise InvalidDateRange(f"The date range may not exceed {MAX_RANGE_DAYS} days.")


def _one_year_earlier(d: date) -> date:
    try:
        return d.replace(year=d.year - 1)
    except ValueError:  # 29 Feb -> 28 Feb
        return d.replace(year=d.year - 1, day=28)


def comparison_range(period: ResolvedPeriod, comparison: ComparisonPeriod) -> tuple[date, date] | None:
    """previous_period: an equally long range ending the day before `start`
         (last 7 days 6-12 Oct  ->  29 Sep - 5 Oct; this_month on the 12th -> the 12 days before the 1st).
       previous_year: the same dates one year earlier."""
    if comparison is ComparisonPeriod.NONE:
        return None
    if comparison is ComparisonPeriod.PREVIOUS_YEAR:
        return _one_year_earlier(period.start), _one_year_earlier(period.end)
    prev_end = period.start - timedelta(days=1)
    return prev_end - timedelta(days=period.days - 1), prev_end
