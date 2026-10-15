from datetime import date
from enum import Enum

MIN_DATE = date(2000, 1, 1)
MAX_DATE = date(2100, 12, 31)
MAX_RANGE_DAYS = 366


class AnalyticsPreset(str, Enum):
    TODAY = "today"
    LAST_7_DAYS = "last_7_days"
    LAST_30_DAYS = "last_30_days"
    THIS_MONTH = "this_month"
    CUSTOM = "custom"


class ComparisonPeriod(str, Enum):
    PREVIOUS_PERIOD = "previous_period"  # the equally long range immediately before the selected one
    PREVIOUS_YEAR = "previous_year"      # the same calendar dates one year earlier
    NONE = "none"                        # skip the comparison
