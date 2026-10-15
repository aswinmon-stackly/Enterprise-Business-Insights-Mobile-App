from app.schemas.analytics import MetricComparison


def compare(current: float, previous: float | None) -> MetricComparison:
    """Period-over-period change that never produces infinity, NaN or a misleading percentage.

    previous is None        -> no comparison requested        direction 'none', change null
    previous == 0 and cur 0 -> nothing happened in either     direction 'flat', change 0.0
    previous == 0 and cur!=0-> no base to divide by           direction 'new',  change null
    otherwise               -> (cur - prev) / |prev| * 100    direction up / down / flat (if it rounds to 0.0)
    """
    if previous is None:
        return MetricComparison(value=current, previous=None, change_pct=None, direction="none")
    if previous == 0:
        if current == 0:
            return MetricComparison(value=current, previous=0, change_pct=0.0, direction="flat")
        return MetricComparison(value=current, previous=0, change_pct=None, direction="new")
    change = round((current - previous) / abs(previous) * 100, 1)
    direction = "flat" if change == 0 else ("up" if change > 0 else "down")
    return MetricComparison(value=current, previous=previous, change_pct=change, direction=direction)
