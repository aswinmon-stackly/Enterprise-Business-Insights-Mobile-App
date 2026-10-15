from datetime import datetime

from sqlalchemy import Date, func, literal_column

from app.utils.dates import BUSINESS_TZ


def local_day(column, dialect_name: str):
    """SQL expression: the calendar date of a timestamptz column in the business time zone.

    PostgreSQL: date(timezone('<zone>', col)).  SQLite (used only by the test-suite) has no zones, so a fixed
    offset is applied. The zone name is validated in Settings and inlined as a literal so SELECT and GROUP BY
    contain the identical expression (bound parameters would make them differ).
    """
    if dialect_name == "postgresql":
        return func.date(func.timezone(literal_column(f"'{BUSINESS_TZ.key}'"), column), type_=Date)
    minutes = int(BUSINESS_TZ.utcoffset(datetime(2026, 1, 1)).total_seconds() // 60)
    return func.date(column, literal_column(f"'{minutes:+d} minutes'"), type_=Date)
