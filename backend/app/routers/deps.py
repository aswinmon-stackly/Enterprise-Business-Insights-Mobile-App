from dataclasses import dataclass

from fastapi import Query


@dataclass(frozen=True)
class Pagination:
    limit: int
    offset: int


def pagination_params(default_limit: int = 20, max_limit: int = 100):
    """Dependency factory: validated limit/offset (422 on out-of-range values)."""

    def dependency(
        limit: int = Query(default_limit, ge=1, le=max_limit, description=f"Page size (1-{max_limit})"),
        offset: int = Query(0, ge=0, description="Rows to skip"),
    ) -> Pagination:
        return Pagination(limit=limit, offset=offset)

    return dependency
